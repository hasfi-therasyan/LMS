# Gemini API Rate Limits Comparison

Informasi tentang rate limits (RPM, TPM, RPD) untuk berbagai model Gemini dan alternatifnya.

## ⚠️ Catatan Penting

Rate limits **bervariasi berdasarkan**:
- **API Tier** (Free tier vs Paid tier)
- **Region** (beberapa region memiliki limits berbeda)
- **Account type** (Personal vs Business)
- **Usage patterns** (burst vs sustained)

**Selalu cek dokumentasi resmi terbaru**: https://ai.google.dev/gemini-api/docs/quota

---

## 📊 Perbandingan Model Gemini

### **Gemini 2.5 Flash** (Current Default)
- **RPM**: ~15 requests/minute (free tier), ~360 requests/minute (paid tier)
- **TPM**: ~1M tokens/minute (free tier), ~32M tokens/minute (paid tier)
- **RPD**: Varies by tier
- **Best for**: High traffic, cost-effective, fast responses
- **Status**: ✅ Stable, recommended for production

### **Gemini 3.0 Flash Preview**
- **RPM**: Similar or higher than 2.5-flash (preview tier)
- **TPM**: Similar or higher than 2.5-flash
- **RPD**: Varies
- **Best for**: Latest features, high traffic
- **Status**: ⚠️ Preview (may change)

### **Gemini 2.5 Pro**
- **RPM**: Lower than Flash (~2-5 requests/minute free tier)
- **TPM**: Lower than Flash (~1M tokens/minute free tier)
- **RPD**: Varies
- **Best for**: Complex reasoning, quality over speed
- **Status**: ✅ Stable

### **Gemini 3.0 Pro Preview**
- **RPM**: Lower than Flash (most powerful)
- **TPM**: Lower than Flash
- **RPD**: Varies
- **Best for**: Most complex tasks
- **Status**: ⚠️ Preview

---

## 🚀 Model dengan Rate Limits Lebih Tinggi

### **1. Gemini 3.0 Flash Preview** ⭐ Recommended
- **Rate Limits**: Similar atau lebih tinggi dari 2.5-flash
- **Pros**: Latest model, potentially higher limits
- **Cons**: Preview (may change), less stable
- **Use case**: High traffic, want latest features

### **2. Upgrade to Paid Tier**
- **Gemini 2.5 Flash (Paid)**: 
  - RPM: Up to 360 requests/minute
  - TPM: Up to 32M tokens/minute
- **Best option**: Keep using 2.5-flash but upgrade tier

### **3. Multiple API Keys (Load Balancing)**
- Use multiple API keys and rotate them
- Distribute requests across keys
- Effectively multiplies your rate limits

---

## 🔄 Alternatif Provider (Jika Gemini Tidak Cukup)

### **OpenAI GPT-4 Turbo**
- **RPM**: ~500 requests/minute (paid tier)
- **TPM**: ~40M tokens/minute (paid tier)
- **Pros**: Very high limits, reliable
- **Cons**: More expensive, different API

### **Anthropic Claude 3.5 Sonnet**
- **RPM**: ~50 requests/minute (paid tier)
- **TPM**: ~40M tokens/minute (paid tier)
- **Pros**: High quality, good limits
- **Cons**: More expensive, different API

### **OpenAI GPT-3.5 Turbo**
- **RPM**: ~3,500 requests/minute (paid tier)
- **TPM**: ~10M tokens/minute (paid tier)
- **Pros**: Very high limits, cheaper
- **Cons**: Less powerful than Gemini 2.5 Flash

---

## 💡 Rekomendasi untuk Production

### **Opsi 1: Tetap Gemini 2.5 Flash + Upgrade Tier** ⭐ Best
- **Action**: Upgrade ke paid tier
- **Result**: 360 RPM, 32M TPM
- **Cost**: Pay per use (very affordable)
- **Reliability**: ✅ Highest

### **Opsi 2: Switch ke Gemini 3.0 Flash Preview**
- **Action**: Change `GEMINI_MODEL=gemini-3-flash-preview`
- **Result**: Potentially higher limits
- **Risk**: Preview model (may change)
- **Reliability**: ⚠️ Good but less stable

### **Opsi 3: Implement Caching**
- **Action**: Cache AI responses for similar questions
- **Result**: Reduce API calls significantly
- **Benefit**: Works with any model
- **Reliability**: ✅ Very high

### **Opsi 4: Load Balancing dengan Multiple Keys**
- **Action**: Use multiple API keys
- **Result**: Multiply rate limits
- **Benefit**: Works with any tier
- **Reliability**: ✅ High

---

## 🛠️ Cara Mengubah Model

### **Option 1: Environment Variable** (Recommended)
```bash
# In backend/.env
GEMINI_MODEL=gemini-3-flash-preview
```

### **Option 2: Update Code**
Edit `backend/src/config/gemini.ts`:
```typescript
return 'gemini-3-flash-preview'; // Instead of gemini-2.5-flash
```

---

## 📈 Monitoring Rate Limits

### **Check Current Usage**
1. Go to Google AI Studio: https://aistudio.google.com/
2. Check "Usage" tab
3. Monitor RPM/TPM usage

### **Handle Rate Limit Errors**
The current code already handles rate limit errors gracefully with:
- Automatic retry with different models
- Clear error messages
- Fallback mechanisms

---

## ✅ Kesimpulan

**Untuk production website dengan high traffic:**

1. **Best Option**: **Gemini 2.5 Flash (Paid Tier)**
   - Stable, reliable
   - High rate limits (360 RPM, 32M TPM)
   - Cost-effective

2. **Alternative**: **Gemini 3.0 Flash Preview**
   - Potentially higher limits
   - Latest features
   - Less stable (preview)

3. **Optimization**: **Implement Caching**
   - Reduce API calls
   - Faster responses
   - Lower costs

**Current setup (Gemini 2.5 Flash) sudah sangat baik untuk production!**
