# Free Maps Setup Guide

## Getting Started with Free Maps

The coordinates input component now includes an interactive map powered by **completely free** mapping services. No API keys or accounts required!

### 🆓 **100% Free Solution**

The component uses:
- **Leaflet** - Open source mapping library
- **OpenStreetMap** - Free, open-source map data
- **Nominatim** - Free geocoding service
- **Multiple Free Tile Providers** - Carto, Stamen, and more

### 🗺️ **Available Map Styles**

Choose from multiple free tile layers:
- **OpenStreetMap** - Standard street map
- **Carto Light** - Clean, minimal design
- **Stamen Toner** - High contrast black and white
- **Stamen Terrain** - Topographic view

### ✨ **Features**

The enhanced coordinates input includes:

- **Interactive Map**: Click anywhere on the map to set coordinates
- **Manual Input**: Type coordinates directly in the lat/lng fields
- **Current Location**: Use browser geolocation to detect your position
- **Address Lookup**: Automatically shows the address for selected coordinates
- **Barcelona Focus**: Map defaults to Barcelona center
- **Toggle Map**: Show/hide the map interface
- **Map Style Selector**: Switch between different free tile layers
- **Real-time Updates**: Map and inputs stay in sync
- **No API Keys**: Completely free, no registration required

### 🚀 **Usage**

The component is automatically used in:
- Location forms (admin dashboard)
- Event forms (for event-specific coordinates)

### 📊 **Free Services**

**OpenStreetMap:**
- Unlimited map loads
- No rate limits
- Community-driven data
- Always free

**Nominatim Geocoding:**
- Free reverse geocoding
- No API keys required
- Rate limited but generous
- Perfect for most applications

### 🎯 **No Setup Required**

Unlike paid services, this solution:
- ✅ Works immediately out of the box
- ✅ No API keys or tokens needed
- ✅ No account registration required
- ✅ No usage limits or billing
- ✅ No credit card required
- ✅ Completely open source

### 🔧 **Technical Details**

**Libraries Used:**
- `leaflet` - Core mapping library
- `react-leaflet` - React integration
- `@types/leaflet` - TypeScript support

**Services Used:**
- OpenStreetMap tiles
- Nominatim geocoding
- Multiple free tile providers

### 🛠️ **Troubleshooting**

### Map Not Loading
- Check browser console for errors
- Ensure internet connection is working
- Try refreshing the page

### Address Not Loading
- Check network connectivity
- Nominatim has rate limits (1 request per second)
- Try again after a short delay

### Coordinates Not Updating
- Ensure coordinates are valid (lat: -90 to 90, lng: -180 to 180)
- Check that the map click handler is working
- Verify the onChange callback is properly connected

### Performance Tips
- The map loads tiles on demand
- First load might be slower
- Subsequent interactions are fast
- All data is cached by the browser

## 🎉 **Benefits of Free Solution**

- **No Vendor Lock-in**: Open source, can be self-hosted
- **No Usage Limits**: Use as much as you want
- **No Billing Surprises**: Completely free forever
- **Community Driven**: Supported by open source community
- **Privacy Friendly**: No tracking or data collection
- **Reliable**: Used by millions of websites worldwide
