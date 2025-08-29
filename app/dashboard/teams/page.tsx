"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchTeam,
  createTeamMember,
  editTeamMember,
  removeTeamMember,
  selectTeam,
  selectTeamLoading,
  TeamMember,
} from "@/lib/redux/slice/teamSlice";
import Image from "next/image";
import { Loader2, Plus, Pencil, Trash, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TeamsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const team = useSelector(selectTeam);
  const loading = useSelector(selectTeamLoading);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TeamMember | null>(null);

  useEffect(() => {
    dispatch(fetchTeam());
  }, [dispatch]);

  const handleAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditItem(member);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      try {
        await dispatch(removeTeamMember(id));
      } catch {
        alert("Failed to delete team member.");
      }
    }
  };

  const filteredTeam = team.filter((member: TeamMember) =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto p-0 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-1 flex-wrap">
        <h2
          className="text-xl font-bold text-[var(--primary-red)]"
          style={{ fontFamily: "var(--font-main)" }}
        >
          Team Members
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <Button
            className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredTeam.map((member: TeamMember) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded shadow flex flex-col items-center"
            >
              <div className="w-28 h-28 mb-3 relative rounded-full overflow-hidden bg-gray-100 border">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-lg text-center">{member.name}</h3>
              <p className="text-sm text-gray-600 text-center">{member.position}</p>
              <p className="text-sm text-gray-600 text-center">{member.bio}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => handleEdit(member)}>
                  <Pencil size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TeamMemberModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editItem={editItem}
          onSaved={() => {
            setModalOpen(false);
            dispatch(fetchTeam());
          }}
        />
      )}
    </div>
  );
};

type TeamMemberModalProps = {
  open: boolean;
  onClose: () => void;
  editItem: TeamMember | null;
  onSaved: () => void;
};

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  open,
  onClose,
  editItem,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState(editItem?.name || "");
  const [position, setPosition] = useState(editItem?.position || "");
  const [bio, setBio] = useState(editItem?.bio || "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(editItem?.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPosition(editItem.position);
      setBio(editItem.bio || "");
      setPreview(editItem.image || null);
      setImage(null);
    } else {
      setName("");
      setPosition("");
      setBio("");
      setPreview(null);
      setImage(null);
    }
  }, [editItem, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("position", position);
      formData.append("bio", bio);
      if (image) {
        formData.append("image", image);
      }

      if (editItem?.id) {
        await dispatch(editTeamMember(editItem.id, formData));
      } else {
        await dispatch(createTeamMember(formData));
      }

      onSaved();
    } catch (err) {
      console.log(err);
      setError("Failed to save team member");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-bold mb-4">
          {editItem ? "Edit Team Member" : "Add Team Member"}
        </h3>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Position</span>
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Bio</span>
            <textarea
              className="border rounded px-2 py-1"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Image</span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="border rounded px-2 py-1"
            />
            {preview && (
              <div className="mt-2 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border"
                />
              </div>
            )}
          </label>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamsPage;
