# QR Code PDF Generation API Documentation

## Overview
यह API bulk में QR codes generate करती है और उन्हें PDF format में download करने की सुविधा देती है। एक A4 page में 6 QR codes आते हैं।

## Features
- ✅ Bulk QR code generation
- ✅ PDF format में download
- ✅ A4 page layout (6 QR codes per page)
- ✅ Individual QR code image generation
- ✅ Admin authentication required for PDF generation
- ✅ Public access for individual QR images

## API Endpoints

### 1. Generate Bulk QR Codes as PDF
**Endpoint:** `POST /api/qr/generate-pdf`  
**Authentication:** Required (Admin)  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "quantity": 12
}
```

#### Parameters
- `quantity` (integer, optional): Number of QR codes to generate (1-1000, default: 6)

#### Response
- **Success (200):** PDF file download
- **Error (400):** Invalid quantity
- **Error (401):** Unauthorized
- **Error (500):** Server error

#### Example Usage
```javascript
// Frontend JavaScript
const generatePDF = async (quantity) => {
  try {
    const response = await fetch('/api/qr/generate-pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: 12 })
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-codes.pdf';
      a.click();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
```

### 2. Generate Single QR Code as Image
**Endpoint:** `GET /api/qr/image/:qrId`  
**Authentication:** Not required  
**Content-Type:** `image/png`

#### Parameters
- `qrId` (path): QR code ID
- `size` (query, optional): Image size in pixels (default: 200)

#### Response
- **Success (200):** PNG image file
- **Error (404):** QR code not found
- **Error (500):** Server error

#### Example Usage
```javascript
// Frontend JavaScript
const getQRImage = (qrId, size = 300) => {
  const img = document.createElement('img');
  img.src = `/api/qr/image/${qrId}?size=${size}`;
  img.alt = `QR Code ${qrId}`;
  return img;
};
```

## PDF Layout Details

### A4 Page Specifications
- **Page Size:** A4 (595.28 x 841.89 points)
- **Margins:** 50 points on all sides
- **QR Codes per Page:** 6 (2 rows x 3 columns)
- **QR Code Size:** Automatically calculated to fit page
- **Spacing:** 20 points padding between QR codes

### PDF Content
- **Header:** "QR Codes - Simhastha Saathi"
- **Generation Date:** Current date
- **QR Code Details:** ID and creation date below each QR
- **Footer:** Total count and generation info

## Database Schema

### QR Codes Table
```sql
CREATE TABLE qr_codes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_member_id (member_id),
  INDEX idx_created_at (created_at),
  INDEX idx_member_created (member_id, created_at)
) ENGINE=InnoDB;
```

## File Structure

```
├── models/
│   └── QR.js                    # QR model with bulk generation
├── controllers/
│   └── qrController.js          # API controllers
├── services/
│   └── pdfService.js            # PDF generation service
├── routes/
│   └── qrRoutes.js              # API routes
└── config/
    └── swagger.js               # API documentation
```

## Dependencies

### Required Packages
```json
{
  "pdfkit": "^0.17.2",
  "qrcode": "^1.5.4"
}
```

### Already Installed
- ✅ `pdfkit` - PDF generation
- ✅ `qrcode` - QR code generation

## Error Handling

### Common Error Responses
```json
// Invalid quantity
{
  "success": false,
  "message": "Quantity must be between 1 and 1000"
}

// Unauthorized
{
  "success": false,
  "message": "Access denied. Admin authentication required."
}

// Server error
{
  "success": false,
  "message": "Failed to generate QR PDF",
  "error": "Detailed error message"
}
```

## Performance Considerations

### Bulk Generation Limits
- **Maximum:** 1000 QR codes per request
- **Recommended:** 100-500 QR codes for optimal performance
- **Memory Usage:** ~2MB per 100 QR codes

### PDF Generation
- **Page Calculation:** Math.ceil(quantity / 6) pages
- **File Size:** ~50KB per page
- **Generation Time:** ~100ms per page

## Testing

### Test Scripts
1. **`test-api-simple.js`** - Basic connectivity test
2. **`test-qr-pdf-api.js`** - Comprehensive API testing

### Manual Testing
```bash
# Start server
npm start

# Test QR image generation
curl http://localhost:3000/api/qr/image/1?size=200

# Test PDF generation (requires admin token)
curl -X POST http://localhost:3000/api/qr/generate-pdf \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 12}' \
  --output qr-codes.pdf
```

## Frontend Integration Examples

### React Component
```jsx
import React, { useState } from 'react';

const QRPDFGenerator = () => {
  const [quantity, setQuantity] = useState(6);
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/qr/generate-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-codes-${quantity}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(e.target.value)}
        min="1" 
        max="1000" 
      />
      <button onClick={generatePDF} disabled={loading}>
        {loading ? 'Generating...' : 'Generate PDF'}
      </button>
    </div>
  );
};
```

### Vue.js Component
```vue
<template>
  <div>
    <input v-model.number="quantity" type="number" min="1" max="1000" />
    <button @click="generatePDF" :disabled="loading">
      {{ loading ? 'Generating...' : 'Generate PDF' }}
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      quantity: 6,
      loading: false
    }
  },
  methods: {
    async generatePDF() {
      this.loading = true;
      try {
        const response = await fetch('/api/qr/generate-pdf', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$store.state.adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: this.quantity })
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-codes-${this.quantity}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

## Security Notes

1. **Admin Authentication:** PDF generation requires admin token
2. **Rate Limiting:** Consider implementing rate limiting for bulk operations
3. **Input Validation:** All inputs are validated before processing
4. **Error Handling:** Sensitive error details are not exposed to client

## Troubleshooting

### Common Issues
1. **Port already in use:** Kill existing process on port 3000
2. **Database connection:** Ensure MySQL is running
3. **Memory issues:** Reduce quantity for large requests
4. **Authentication:** Verify admin token is valid

### Debug Steps
1. Check server logs for errors
2. Verify database connection
3. Test with small quantity first
4. Check authentication token validity

## Support

For issues or questions:
1. Check server logs
2. Verify API documentation
3. Test with provided test scripts
4. Contact development team

---

**Created by:** Simhastha Saathi Development Team  
**Last Updated:** $(date)  
**Version:** 1.0.0
