import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addOffer, updateOffer, fetchOffer, Offer } from "@/lib/redux/slice/offerSlice";
import { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

interface OfferModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    editOffer: Offer | null;
}

export default function OfferModal({ open, setOpen, editOffer }: OfferModalProps) {
    const dispatch = useDispatch<AppDispatch>();

    const [title, setTitle] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (editOffer) {
            setTitle(editOffer.title);
            setCode(editOffer.code);
            setDescription(editOffer.description);
        } else {
            setTitle("");
            setCode("");
            setDescription("");
        }
    }, [editOffer]);

    const handleSubmit = async () => {
        const data = { title, code, description };

        if (editOffer) {
            await dispatch(updateOffer(data));
            toast.success("Offer updated!");
        } else {
            await dispatch(addOffer(data));
            toast.success("Offer added!");
        }

        dispatch(fetchOffer());
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">
                        {editOffer ? "Edit Offer" : "Add Offer"}
                    </h2>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <Button onClick={handleSubmit} className="w-full bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]">
                        {editOffer ? "Update Offer" : "Add Offer"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
