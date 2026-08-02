import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminAiSettings({ showToast }: any) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/ai-settings').then(response => setPrompt(response.data?.data?.systemPrompt || ''))
      .catch(() => showToast?.('Không thể tải cấu hình AI.', 'error')).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const value = prompt.trim();
    if (!value || value.length > 8000) return showToast?.('System prompt phải có từ 1 đến 8000 ký tự.', 'error');
    setSaving(true);
    try {
      const response = await api.put('/admin/ai-settings', { systemPrompt: value });
      setPrompt(response.data?.data?.systemPrompt || value);
      showToast?.('Đã lưu system prompt cho chatbot.', 'success');
    } catch (error: any) {
      showToast?.(error.response?.data?.message || 'Không thể lưu cấu hình AI.', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8">Đang tải cấu hình AI...</div>;
  return <div className="space-y-6 max-w-4xl">
    <div className="border-b border-outline-variant pb-4">
      <h2 className="font-headline-md text-headline-md text-primary">Cấu Hình DuoStyle AI</h2>
      <p className="text-sm text-on-surface-variant mt-1">System prompt này được lưu trong MySQL và áp dụng cho các cuộc chat tiếp theo.</p>
    </div>
    <div className="bg-white border border-outline-variant rounded-lg p-6 space-y-3">
      <div className="flex justify-between text-xs font-bold"><label>System prompt</label><span>{prompt.length}/8000</span></div>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={8000} rows={16}
        className="w-full border border-outline-variant rounded-lg p-4 text-sm leading-6 outline-none focus:border-primary" />
      <div className="flex justify-end"><button onClick={save} disabled={saving || !prompt.trim()}
        className="bg-primary text-white px-6 py-3 rounded font-bold disabled:opacity-40 cursor-pointer">
        {saving ? 'Đang lưu...' : 'Lưu cấu hình AI'}
      </button></div>
    </div>
  </div>;
}
