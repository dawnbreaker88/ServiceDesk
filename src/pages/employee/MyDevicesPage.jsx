import React, { useState, useEffect } from 'react';
import { getMyAssets } from '../../api/assetApi';
import { Laptop, ShieldCheck, Check, Calendar, HardDrive, Cpu } from 'lucide-react';

export default function MyDevicesPage({ onStartSupportWithAsset }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const res = await getMyAssets();
        if (res.success) {
          setAssets(res.data);
        }
      } catch (err) {
        console.error('Failed to load my assets:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, []);

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div>
        <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">My Assigned Devices</h1>
        <p className="text-[13px] text-[#737373]">
          Hardware and equipment currently allocated to your user account
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[13px] text-[#737373]">
          Loading allocated devices...
        </div>
      ) : assets.length === 0 ? (
        <div className="p-12 bg-white border border-[#e5e5e5] rounded-[16px] text-center">
          <Laptop className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
          <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No company assets assigned</h3>
          <p className="text-[13px] text-[#737373]">
            If you need equipment allocated, contact your IT Asset Manager.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <div
              key={asset._id}
              className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 flex flex-col justify-between hover:border-[#d4d4d4] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
                    <Laptop className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <span className="font-mono text-[12px] bg-[#f5f5f5] px-2.5 py-1 rounded border border-[#e5e5e5] text-[#0a0a0a] font-semibold">
                    {asset.assetTag}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-lg text-[#0a0a0a] mb-1">
                  {asset.name}
                </h3>
                <p className="text-[13px] text-[#525252] mb-4">
                  Model: {asset.model || 'Standard Corporate Hardware'}
                </p>

                <div className="space-y-2 text-[12px] bg-[#fafafa] p-3 rounded-[8px] border border-[#e5e5e5] font-mono mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Serial No:</span>
                    <span className="text-[#0a0a0a]">{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Category:</span>
                    <span className="text-[#0a0a0a]">{asset.category}</span>
                  </div>
                  {asset.warrantyExpiry && (
                    <div className="flex justify-between">
                      <span className="text-[#737373]">Warranty:</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#f5f5f5] flex justify-end">
                <button
                  onClick={() => onStartSupportWithAsset(asset.name)}
                  className="px-3.5 py-1.5 text-[12px] font-medium text-[#171717] bg-[#ffffff] border border-[#e5e5e5] rounded-[6px] hover:bg-[#f5f5f5] transition-all"
                >
                  Report Issue with Device
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
