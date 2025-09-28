import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
interface FileUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label: string;
  description: string;
  multiple?: boolean;
  className?: string;
}
export function FileUpload({
  value,
  onChange,
  label,
  description,
  multiple = false,
  className,
}: FileUploadProps) {
  const [inputValue, setInputValue] = useState('');
  const handleAdd = () => {
    if (!inputValue.trim() || !inputValue.startsWith('http')) {
      // Basic URL validation
      return;
    }
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange([...currentValues, inputValue]);
    } else {
      onChange(inputValue);
    }
    setInputValue('');
  };
  const handleRemove = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((url) => url !== urlToRemove));
    } else {
      onChange('');
    }
  };
  const renderPreview = () => {
    const urls = Array.isArray(value) ? value : (value ? [value] : []);
    if (urls.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg h-32">
          <ImageIcon className="w-8 h-8 mb-2" />
          <p className="text-sm">No images uploaded</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {urls.map((url) => (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative group aspect-square"
            >
              <img
                src={url}
                alt="Uploaded preview"
                className="w-full h-full object-cover rounded-lg border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove(url)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };
  return (
    <div className={className}>
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <Card>
        <CardContent className="p-4 space-y-4">
          {renderPreview()}
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="Paste image URL here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              disabled={!multiple && !!value && typeof value === 'string'}
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!inputValue.trim() || (!multiple && !!value && typeof value === 'string')}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}