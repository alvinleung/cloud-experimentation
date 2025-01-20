// Define the AssetManifest interface
type AssetManifest = {
  [key: string]: URL; // Keys are strings, and values are strings
};

// Define the AssetMap interface, which maps keys of AssetManifest to HTMLImagetement
type AssetMap<T extends Partial<AssetManifest>> = {
  [K in keyof T]: HTMLImageElement;
};

export const ERROR_IMAGE = new Image();

export function loadAssets<T extends AssetManifest>(manifest: T) {
  return new Promise<AssetMap<T>>((resolve, reject) => {
    let loadedAssets = {} as AssetMap<T>;

    for (let [imageResourceName, imageURL] of Object.entries(manifest)) {
      const image = new Image();
      image.src = imageURL.href;
      image.onload = () => {
        loadedAssets[imageResourceName as keyof T] = image;
        attemptFinishLoading();
      };

      image.onerror = () => {
        loadedAssets[imageResourceName as keyof T] = ERROR_IMAGE;
        attemptFinishLoading();
      };
    }

    function attemptFinishLoading() {
      const hasLoadedAll =
        Object.keys(manifest).length === Object.keys(loadedAssets).length;

      if (hasLoadedAll) {
        resolve(loadedAssets);
      }
    }
  });
}
