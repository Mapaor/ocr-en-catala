import React, { useState } from "react";
import OCRComponent from "./components/OCRComponent"
import GitHub from "./components/GitHub";

export default function HomePage() {
  return (
    <div className="mb-6">
      <OCRComponent />
      <GitHub />
    </div>
  );
}