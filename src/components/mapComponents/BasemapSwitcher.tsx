import { ClickAwayListener, Grow } from "@mui/material";
import { basemaps, BasemapId } from "./mapLayers.ts";
import { styled } from "@mui/material/styles";
import { Paper, ButtonBase } from "@mui/material";
import { useState } from "react";

type Props = {
  current: BasemapId;
  onChange: (id: BasemapId) => void;
};

export default function BasemapSwitcher({ current, onChange }: Props) {
    const [open, setOpen] = useState(false);

    const handleSelect = (id: BasemapId) => {
        onChange(id);
        setOpen(false);
    };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
        <TriggerButton onClick={() => setOpen((prev) => !prev)} aria-label="Change map style">
          <TriggerSwatch color={basemaps[current].swatch} />
        </TriggerButton>

        <Grow in={open} style={{ transformOrigin: "bottom right" }}>
          <OptionsPanel elevation={0} sx={{ display: open ? "flex" : "none" }}>
            {Object.entries(basemaps).map(([id, { label, swatch }]) => (
              <OptionRow
                key={id}
                selected={id === current}
                onClick={() => handleSelect(id as BasemapId)}
              >
                <OptionSwatch color={swatch} />
                <OptionLabel>{label}</OptionLabel>
              </OptionRow>
            ))}
          </OptionsPanel>
        </Grow>
      </div>
    </ClickAwayListener>
  );
}

// the little pill visible at all times
const TriggerButton = styled(ButtonBase)(() => ({
  position: "absolute",
  bottom: "145px",
  right: 16,
  // zIndex: theme.zIndex.tooltip,
  width: 44,
  height: 44,
  borderRadius: "50%",
  backgroundColor: "#fff",
  boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  "&:hover": {
    transform: "scale(1.06)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  },
}));

// swatch shown inside trigger button
const TriggerSwatch = styled("span")<{ color: string }>(({ color }) => ({
  width: 26,
  height: 26,
  borderRadius: "50%",
  backgroundColor: color,
  border: "2px solid rgba(0,0,0,0.08)",
}));

// the popover panel with option list
const OptionsPanel = styled(Paper)(({ theme }) => ({
  position: "absolute",
  bottom: "197px",
  right: 16,
  zIndex: theme.zIndex.tooltip,
  borderRadius: 18,
  padding: "6px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  backgroundColor: "rgba(255,255,255,0.97)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  transformOrigin: "bottom right",
}));

const OptionRow = styled(ButtonBase)<{ selected?: boolean }>(({ selected }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  borderRadius: 12,
  width: "100%",
  justifyContent: "flex-start",
  backgroundColor: selected ? "rgba(178,58,72,0.1)" : "transparent",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: selected ? "rgba(178,58,72,0.15)" : "rgba(0,0,0,0.04)",
  },
}));

const OptionSwatch = styled("span")<{ color: string }>(({ color }) => ({
  width: 18,
  height: 18,
  borderRadius: "50%",
  backgroundColor: color,
  border: "2px solid rgba(0,0,0,0.08)",
  flexShrink: 0,
}));

const OptionLabel = styled("span")({
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "#3a3a3a",
  whiteSpace: "nowrap",
});