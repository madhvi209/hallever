"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { fetchTestimonials, selectTestimonials, selectIsLoading, deleteTestimonial, addTestimonial, updateTestimonial, Testimonial,} from "@/lib/redux/slice/testimonialsSlice";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Plus, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";

const TestimonialsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const testimonials = useSelector(selectTestimonials);
  const loading = useSelector(selectIsLoading);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchTestimonials());
  }, [dispatch]);

  const openAddModal = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditItem(testimonial);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      dispatch(deleteTestimonial(id));
    }
  };

  const filteredTestimonials = testimonials.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.event.toLowerCase().includes(search.toLowerCase()) ||
    t.location.toLowerCase().includes(search.toLowerCase()) ||
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto p-0 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-1 flex-wrap">
        <h2
          className="text-xl font-bold text-[var(--primary-red)]"
          style={{ fontFamily: "var(--font-main)" }}
        >
          Testimonials
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search testimonials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <Button
            onClick={openAddModal}
            className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-4 rounded shadow flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{testimonial.name}</h2>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-gray-300">★</span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{testimonial.event}</span>
                {" | "}
                <span>{testimonial.location}</span>
              </div>
              <p className="text-gray-800">{testimonial.text}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => openEditModal(testimonial)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(testimonial.id!)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TestimonialModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editItem={editItem}
          onSaved={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

type TestimonialModalProps = {
  open: boolean;
  onClose: () => void;
  editItem: Testimonial | null;
  onSaved: () => void;
};

const TestimonialModal: React.FC<TestimonialModalProps> = ({
  open,
  onClose,
  editItem,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState(editItem?.name || "");
  const [event, setEvent] = useState(editItem?.event || "");
  const [location, setLocation] = useState(editItem?.location || "");
  const [rating, setRating] = useState(editItem?.rating || 5);
  const [text, setText] = useState(editItem?.text || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setEvent(editItem.event);
      setLocation(editItem.location);
      setRating(editItem.rating);
      setText(editItem.text);
    } else {
      setName("");
      setEvent("");
      setLocation("");
      setRating(5);
      setText("");
    }
  }, [editItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { name, event, location, rating, text };

    try {
      if (editItem?.id) {
          await dispatch(updateTestimonial(editItem.id, payload));
      } else {
        await dispatch(addTestimonial(payload));
      }
      onSaved();
    } catch (err) {
      console.log(err);
      setError("Failed to save testimonial");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-bold mb-4">
          {editItem ? "Edit Testimonial" : "Add Testimonial"}
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
            <span className="font-medium">Event</span>
            <Input
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Location</span>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Rating</span>
            <select
              className="border rounded px-2 py-1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Testimonial</span>
            <textarea
              className="border rounded px-2 py-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
            />
          </label>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialsPage;

