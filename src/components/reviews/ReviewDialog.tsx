'use client';

import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewType: 'booking' | 'guider';
  onSubmit: (rating: number, comment: string) => Promise<void>;
  existingReview?: {
    rating: number;
    comment?: string;
  } | null;
}

export default function ReviewDialog({
  open,
  onOpenChange,
  reviewType,
  onSubmit,
  existingReview,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when existingReview changes or when dialog opens
  useEffect(() => {
    if (open) {
      // When dialog opens, populate with existing review data if available
      if (existingReview) {
        setRating(existingReview.rating || 0);
        setComment(existingReview.comment || '');
      } else {
        // Reset to empty when creating new review
        setRating(0);
        setComment('');
      }
    }
  }, [existingReview, open]); // Update when dialog opens or existingReview changes

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onOpenChange(false);
      // Reset form after successful submission
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Update' : 'Write'} Your {reviewType === 'booking' ? 'Tour/Plan' : 'Guider'} Review
          </DialogTitle>
          <DialogDescription>
            {reviewType === 'booking'
              ? 'Rate and review your overall tour experience. This review will be visible on the tour/plan page and help other travelers make informed decisions.'
              : 'Rate and review your guide\'s service. This review will be visible on the guider\'s profile and help other travelers find great guides.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-8 h-8 ${
                      value <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Review Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                reviewType === 'booking'
                  ? 'Share your thoughts about the tour, activities, itinerary, value for money, etc...'
                  : 'Share your thoughts about the guide\'s knowledge, communication, professionalism, helpfulness, etc...'
              }
              rows={6}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating < 1 || rating > 5 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

