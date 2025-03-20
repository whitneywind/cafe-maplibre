function loadMarkerIcon({ map, marker, iconId }) {
  return new Promise((resolve, reject) => {
    const icon = new Image();
    const svgString = renderToString(marker);
    const svg = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svg);
    icon.onload = () => {
      map.addImage(iconId, icon);
      URL.revokeObjectURL(url);
      resolve();
    };
    icon.src = url;
  });
}

export function loadMarkerIcons(map) {
  const iconLoaders = [];

  MARKER_CATEGORIES.forEach((category) => {
    SELECTED_VALUES.forEach((selected) => {
      iconLoaders.push(
        loadMarkerIcon({
          map,
          marker: (
            <MapMarker
              category={category}
              selected={selected}
              scale={MARKER_SCALE}
            />
          ),
          iconId: getIconId(category, selected),
        })
      );
    });
  });

  return Promise.all(iconLoaders);
}
