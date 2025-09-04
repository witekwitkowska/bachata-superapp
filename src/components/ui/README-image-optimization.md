# Image Optimization with Face Detection

This project includes smart image components that automatically adjust image positioning to focus on faces and important content.

## Components

### 1. `FaceFocusedImage` (CSS-based approach)
A lightweight component that uses CSS `object-position` to focus on specific areas of images.

**Features:**
- Automatic loading states with skeleton
- Error handling with fallback images
- Configurable object positioning
- Performance optimized with lazy loading

**Usage:**
```tsx
import { FaceFocusedImage } from "@/components/ui/face-focused-image";

<FaceFocusedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
  objectPosition="top" // "center" | "top" | "bottom" | etc.
  priority={false}
  fallback="/images/placeholder.jpg"
/>
```

### 2. `SmartImage` (Cloudinary-based approach)
A more advanced component that uses Cloudinary's AI-powered face detection and smart cropping.

**Features:**
- Automatic face detection and centering
- Smart cropping with AI
- Multiple focus modes (face, auto, center)
- Automatic format optimization (WebP, AVIF)
- Quality optimization

**Usage:**
```tsx
import { SmartImage } from "@/components/ui/smart-image";

<SmartImage
  src="https://res.cloudinary.com/your-cloud/image/upload/sample.jpg"
  alt="Description"
  width={400}
  height={300}
  focus="face" // "face" | "auto" | "center"
  quality={80}
  format="auto"
/>
```

## Setup

### For Cloudinary (Recommended)

1. **Install dependencies** (already done):
   ```bash
   npm install @cloudinary/react @cloudinary/url-gen
   ```

2. **Set up environment variable**:
   ```bash
   # .env.local
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

3. **Upload images to Cloudinary** or use existing Cloudinary URLs

### For CSS-only approach

No additional setup required. Works with any image URL.

## Best Practices

### Object Position Guidelines

- **`object-top`**: For portraits and headshots (faces at top)
- **`object-center`**: For group photos and general content
- **`object-bottom`**: For full-body shots or landscape photos

### Performance Tips

1. **Use `priority={true}`** for above-the-fold images
2. **Set appropriate `sizes`** for responsive images
3. **Provide fallback images** for better UX
4. **Use WebP format** when possible (automatic with Cloudinary)

### Cloudinary Focus Modes

- **`face`**: Automatically detects and centers faces
- **`auto`**: Uses AI to find the most important part of the image
- **`center`**: Traditional center cropping

## Implementation Examples

### Homepage Cards
```tsx
<FaceFocusedImage
  src={result.image}
  alt={result.title}
  width={400}
  height={192}
  objectPosition={result.type === "artist" ? "top" : "center"}
  priority={index < 4}
/>
```

### Event Details
```tsx
<FaceFocusedImage
  src={event.images[currentImageIndex]}
  alt={event.title}
  width={800}
  height={384}
  objectPosition="center"
  priority={currentImageIndex === 0}
/>
```

### Profile Images
```tsx
<SmartImage
  src={user.avatar}
  alt={user.name}
  width={200}
  height={200}
  focus="face"
  className="rounded-full"
/>
```

## Migration Guide

### From regular `<img>` tags:

**Before:**
```tsx
<img
  src={image}
  alt="Description"
  className="object-cover w-full h-48"
/>
```

**After:**
```tsx
<FaceFocusedImage
  src={image}
  alt="Description"
  width={400}
  height={192}
  className="w-full h-48"
  objectPosition="center"
/>
```

## Troubleshooting

### Common Issues

1. **Cloudinary not working**: Check your `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` environment variable
2. **Images not loading**: Ensure fallback images exist in `/public/images/`
3. **Poor performance**: Use `priority={false}` for below-the-fold images

### Fallback Strategy

The components automatically fall back to:
1. Regular `<img>` tag if Cloudinary fails
2. Fallback image if main image fails to load
3. Loading skeleton while image loads

## Future Enhancements

- [ ] Automatic aspect ratio detection
- [ ] Multiple face detection for group photos
- [ ] Integration with other image services (ImageKit, etc.)
- [ ] Advanced AI cropping options
