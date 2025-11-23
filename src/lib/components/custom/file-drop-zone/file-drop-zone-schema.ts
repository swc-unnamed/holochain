import z from "zod";

export const fileDropZoneSchema = z.object({
  attachments: z.array(z.instanceof(File))
});

export type FileDropZoneSchema = z.infer<typeof fileDropZoneSchema>;