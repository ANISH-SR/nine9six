"use client"
import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useState } from "react"

export function UploadImage({ onImageAdded, image }: {
    onImageAdded: (image: string) => void;
    image?: string;
}) {
    const [uploading, setUploading] = useState(false);

    async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            const presignedUrl = response.data.preSignedUrl;
            const formData = new FormData();
            const fields = response.data.fields;
            formData.set("bucket", fields["bucket"]);
            formData.set("X-Amz-Algorithm", fields["X-Amz-Algorithm"]);
            formData.set("X-Amz-Credential", fields["X-Amz-Credential"]);
            formData.set("X-Amz-Date", fields["X-Amz-Date"]);
            formData.set("key", fields["key"]);
            formData.set("Policy", fields["Policy"]);
            formData.set("X-Amz-Signature", fields["X-Amz-Signature"]);
            formData.append("file", file);
            await axios.post(presignedUrl, formData);

            onImageAdded(`${CLOUDFRONT_URL}/${fields["key"]}`);
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
            input.value = "";
        }
    }

    if (image) {
        return (
            <div className="p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-96 max-w-full rounded-md" src={image} alt="Uploaded option" />
            </div>
        );
    }

    return (
        <div>
            <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
                <div className="h-full flex justify-center flex-col relative w-full">
                    <div className="h-full flex justify-center w-full pt-16 text-4xl">
                        {uploading ? (
                            <div className="text-sm">Loading...</div>
                        ) : (
                            <>
                                +
                                <input
                                    className="absolute opacity-0 w-40 h-40"
                                    type="file"
                                    accept="image/*"
                                    style={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                    onChange={onFileSelect}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
