import { useState } from 'react';
import { NO_IMAGE } from '../lib/recipeUtils';

type SafeImageProps = {
    src?: string;
    alt: string;
};

export default function SafeImage({ src, alt }: SafeImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
    const shown = !src || failedSrc === src ? NO_IMAGE : src;

    return <img src={shown} alt={alt} onError={() => setFailedSrc(src)} />;
}
