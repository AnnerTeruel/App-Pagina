'use client';

import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ImageZoomProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function ImageZoom({ src, alt, fill = false, className = '', priority = false, sizes }: ImageZoomProps) {
  return (
    <Zoom>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        priority={priority}
        sizes={sizes}
      />
    </Zoom>
  );
}
