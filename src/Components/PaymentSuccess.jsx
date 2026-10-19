"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    console.log("Params", params)
    const info = {
      transactionReference: params.get("transactionreference"),
      orderReference: params.get("orderreference"),
      settleStatus: params.get("settlestatus"),
      errorCode: params.get("errorcode"),
    };

    setPaymentInfo(info);
  }, [location]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Success</h2>
      {paymentInfo ? (
        <div className="space-y-2">
          <p><strong>Transaction Reference:</strong> {paymentInfo.transactionReference}</p>
          <p><strong>Order Reference:</strong> {paymentInfo.orderReference}</p>
          <p><strong>Settle Status:</strong> {paymentInfo.settleStatus}</p>
          <p><strong>Error Code:</strong> {paymentInfo.errorCode || "None"}</p>
        </div>
      ) : (
        <p>Loading payment information...</p>
      )}
    </div>
  );
};

export default PaymentSuccess;
