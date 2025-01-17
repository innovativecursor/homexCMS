import React, { useEffect, useState } from "react";
import PageWrapper from "../PageContainer/PageWrapper";
import { Button, Input, Select } from "antd";
import { getAxiosCall, updateAxiosCall } from "../../Axios/UniversalAxiosCalls";
import axios from "axios";
import Swal from "sweetalert2";
import { HexColorPicker } from "react-colorful";

function FontColor() {
  const [fonts, setFonts] = useState([]);
  const [currentPack, setCurrentPack] = useState({});
  const [colors, setColors] = useState({
    navTextColor: "#182a64",
    navIconsColor: "#EBD26E",
    heroMainTextColor: "#ffff",
    heroSubTextColor: "#ffff",
    universalButtonColor: "#EBD26E",
    universalSelectorTextColor: "#EBD26E",
    universalHeadingTextColor: "#182a64",
    universalContentTextColor: "#676767",
  });
  const [packId, setPackId] = useState(null);
  const [defaults, setDefaults] = useState({});
  const [iframeSrc, setIframeSrc] = useState(
    `${process.env.REACT_APP_CLIENT}?font=${currentPack?.value}${Object.entries(
      colors
    )
      .map(
        ([key, value]) =>
          `&${key}=${encodeURIComponent(String(value)?.replace("#", "%23"))}`
      )
      .join("")}`
  );

  useEffect(() => {
    setDefaults(colors);
    font();
    fetchCurrentFont();

    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.onload = () => {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          const style = iframeDoc.createElement("style");
          style.innerHTML = `
            body {
              font-family: 'Arial', sans-serif !important;
            }
          `;
          iframeDoc.head.appendChild(style);
        }
      };
    }
  }, []);
  useEffect(() => {
    setIframeSrc(
      `${process.env.REACT_APP_CLIENT}?font=${
        currentPack?.value
      }${Object.entries(colors)
        .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
        .join("")}`
    );
  }, [currentPack, colors]);

  const fetchCurrentFont = async () => {
    const getCurrentFontColor = await getAxiosCall("/getFontColor");

    setCurrentPack({
      value: getCurrentFontColor?.data[0]?.font_name
        ? getCurrentFontColor?.data[0]?.font_name
        : "Work Sans",
      label: getCurrentFontColor?.data[0]?.font_name
        ? getCurrentFontColor?.data[0]?.font_name
        : "Work Sans",
    });
    setPackId(getCurrentFontColor?.data?.pack_id);
    setColors({
      navTextColor: getCurrentFontColor?.data[0]?.navTextColor || "#182a64",
      navIconsColor: getCurrentFontColor?.data[0]?.navIconsColor || "#EBD26E",
      heroMainTextColor:
        getCurrentFontColor?.data[0]?.heroMainTextColor || "#fff",
      heroSubTextColor:
        getCurrentFontColor?.data[0]?.heroSubTextColor || "#fff",
      universalButtonColor:
        getCurrentFontColor?.data[0]?.universalButtonColor || "#EBD26E",
      universalSelectorTextColor:
        getCurrentFontColor?.data[0]?.universalSelectorTextColor || "#EBD26E",
      universalHeadingTextColor:
        getCurrentFontColor?.data[0]?.universalHeadingTextColor || "#182a64",
      universalContentTextColor:
        getCurrentFontColor?.data[0]?.universalContentTextColor || "#676767",
    });
  };

  const font = async () => {
    const response = await axios.get(
      `https://webfonts.googleapis.com/v1/webfonts?key=${process.env.FONT_KEY}`
    );
    const filteredRes = response?.data?.items?.map((el) => {
      return { value: el?.family, label: el?.family };
    });
    setFonts([...filteredRes]);
  };

  const handleColorChange = (key, value) => {
    setColors((prevColors) => ({
      ...prevColors,
      [key]: value,
    }));
  };

  const updateChanges = async () => {
    const aggrigatedPayload = Object.assign(colors, {
      font_name: currentPack?.value,
    });
    const updatedRes = await updateAxiosCall(
      "/updateFontColor",
      packId ? packId : 1,
      aggrigatedPayload
    );
    if (updatedRes) {
      Swal.fire({
        title: "Success",
        text: updatedRes?.message,
        icon: "success",
        confirmButtonText: "Great!",
        allowOutsideClick: false,
      }).then(() => {
        window.location.reload();
      });
    }
  };
  const reset = () => {
    setColors(defaults);
    setCurrentPack({
      label: "Work Sans",
      value: "Work Sans",
    });
  };
  return (
    <PageWrapper title="Font Style & Color">
      <div className="container mx-auto p-4 text-xl">
        <div className="grid grid-cols-1 mb-8 sm:grid-cols-2 md:grid-cols-3 gap-6 py-4">
          {Object?.keys(colors)?.map((key) => (
            <div key={key} className="ColorPicker">
              <div className="label">{key?.replace(/([A-Z])/g, " $1")}</div>
              <div className="Select_color flex flex-col gap-4">
                <HexColorPicker
                  color={colors[key]}
                  onChange={(value) => handleColorChange(key, value)}
                />
                <Input
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  value={colors[key]}
                />
                {/* <div className="flex items-center">
                  <Button onClick={updateChanges}>Save</Button>
                </div> */}
              </div>
            </div>
          ))}
          <div className="Select Font">
            <div className="label">Select Font</div>
            <div className="Select Fonts flex gap-4">
              <Select
                showSearch
                style={{
                  width: 200,
                }}
                optionFilterProp="label"
                placeholder="Search to find Fonts"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                options={fonts}
                onChange={(e) => {
                  setCurrentPack({
                    label: e,
                    value: e,
                  });
                }}
                value={currentPack}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={updateChanges}>Save</Button>
          <Button onClick={reset}>Reset to Defaults</Button>
        </div>
      </div>
      <div style={{ width: "100%", height: "100vh", border: "none" }}>
        <iframe
          src={iframeSrc}
          title="DLM Realty and Construction"
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
        ></iframe>
      </div>
    </PageWrapper>
  );
}

export default FontColor;
