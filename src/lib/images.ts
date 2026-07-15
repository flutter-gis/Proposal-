/**
 * Image Registry (v3 — real-photo sources)
 * Maps image keys to OSS-hosted image URLs fetched via z-ai image-search.
 *
 * Sources: real visitor photos from Tripadvisor, Yelp, NH State Parks,
 * WMUR, Yankee Magazine, Union Leader, Reddit, YouTube, hiking blogs,
 * US Forest Service / NPS, etc. Stock-photo sites (Alamy, Shutterstock,
 * Getty, Dreamstime, etc.) and tiny thumbnails are filtered out.
 */

export type ImageEntry = {
  key: string;
  urls: string[];
  alt: string;
};

export const IMAGES: Record<string, ImageEntry> = {
  artists_bluff: {
    key: "artists_bluff",
    urls: ["https://sfile.chatglm.cn/images-ppt/591536236a90.jpg", "https://sfile.chatglm.cn/images-ppt/99f251f80f55.jpg", "https://sfile.chatglm.cn/images-ppt/6b9b2e48e88a.jpg", "https://sfile.chatglm.cn/images-ppt/11c0980ba21e.jpg", "https://sfile.chatglm.cn/images-ppt/ad0037374fee.jpg"],
    alt: `Artists Bluff Trail Franconia Notch scenic view`,
  },
  bakery: {
    key: "bakery",
    urls: ["https://sfile.chatglm.cn/images-ppt/1053d28df562.jpg", "https://sfile.chatglm.cn/images-ppt/6d1ce69f38f0.jpg", "https://sfile.chatglm.cn/images-ppt/01d4fd801c36.jpg"],
    alt: `French bakery pastries and coffee`,
  },
  balsams: {
    key: "balsams",
    urls: ["https://sfile.chatglm.cn/images-ppt/12d6e65f288d.jpg", "https://sfile.chatglm.cn/images-ppt/c0ee4d7e7b73.jpg", "https://sfile.chatglm.cn/images-ppt/486e723b3ae5.jpg", "https://sfile.chatglm.cn/images-ppt/301a02a6bc37.jpg", "https://sfile.chatglm.cn/images-ppt/12a2e1a0b9d4.jpg"],
    alt: `Balsams Grand Resort historic hotel`,
  },
  bear_brook_real: {
    key: "bear_brook_real",
    urls: ["https://sfile.chatglm.cn/images-ppt/ca341b1ae540.jpg", "https://sfile.chatglm.cn/images-ppt/31e49cae46ff.jpg", "https://sfile.chatglm.cn/images-ppt/da7b1a1e7c32.jpg", "https://sfile.chatglm.cn/images-ppt/f024e434dd2d.jpg", "https://sfile.chatglm.cn/images-ppt/5ccfe132c7a3.jpeg"],
    alt: `Bear Brook State Park cabin Allenstown New Hampshire`,
  },
  benson_park: {
    key: "benson_park",
    urls: ["https://sfile.chatglm.cn/images-ppt/4751b4e975dc.jpg", "https://sfile.chatglm.cn/images-ppt/bc5be7200825.jpeg", "https://sfile.chatglm.cn/images-ppt/bbac46d63b3d.jpg", "https://sfile.chatglm.cn/images-ppt/7eb7f3d0f64c.jpg", "https://sfile.chatglm.cn/images-ppt/8ffcdab61cdc.jpg"],
    alt: `Benson Park abandoned wild animal farm Hudson NH`,
  },
  cabin: {
    key: "cabin",
    urls: ["https://sfile.chatglm.cn/images-ppt/d77094dbb04a.jpg", "https://sfile.chatglm.cn/images-ppt/ca1803fe8d03.jpg", "https://sfile.chatglm.cn/images-ppt/1bc45b778783.jpg", "https://sfile.chatglm.cn/images-ppt/fe88e9ece6fe.jpg", "https://sfile.chatglm.cn/images-ppt/4a452750c3a0.jpg"],
    alt: `Rustic log cabin porch forest`,
  },
  campfire: {
    key: "campfire",
    urls: ["https://sfile.chatglm.cn/images-ppt/43526b1ea7dc.jpg", "https://sfile.chatglm.cn/images-ppt/9fbb78da6a99.jpeg", "https://sfile.chatglm.cn/images-ppt/98bfe5f2b75c.jpeg"],
    alt: `Romantic campfire in forest at night`,
  },
  canoe: {
    key: "canoe",
    urls: ["https://sfile.chatglm.cn/images-ppt/f450ec11c749.jpg", "https://sfile.chatglm.cn/images-ppt/5fbe87f16a36.jpg", "https://sfile.chatglm.cn/images-ppt/142ee39dfb50.png"],
    alt: `Canoe paddle peaceful lake sunset`,
  },
  coleman: {
    key: "coleman",
    urls: ["https://sfile.chatglm.cn/images-ppt/252b3bca3244.jpg", "https://sfile.chatglm.cn/images-ppt/bbd6f30a790b.jpg", "https://sfile.chatglm.cn/images-ppt/e6a0a604850d.jpg", "https://sfile.chatglm.cn/images-ppt/9e6171ea7d35.jpg", "https://sfile.chatglm.cn/images-ppt/a259fcfaa120.jpg"],
    alt: `Coleman State Park cabin wilderness pond`,
  },
  connecticut_lakes: {
    key: "connecticut_lakes",
    urls: ["https://sfile.chatglm.cn/images-ppt/3e8c3085259b.jpeg", "https://sfile.chatglm.cn/images-ppt/1eeac8dbc0e9.jpg", "https://sfile.chatglm.cn/images-ppt/2d59523dd468.jpg", "https://sfile.chatglm.cn/images-ppt/54e7d109d7a8.jpg", "https://sfile.chatglm.cn/images-ppt/45d49c3133d4.jpg"],
    alt: `Connecticut Lakes Pittsburg New Hampshire Fourth Lake border`,
  },
  dixville: {
    key: "dixville",
    urls: ["https://sfile.chatglm.cn/images-ppt/ef57399e92fa.jpg", "https://sfile.chatglm.cn/images-ppt/7591abd1587c.jpg", "https://sfile.chatglm.cn/images-ppt/a3d9dcfb0714.jpg", "https://sfile.chatglm.cn/images-ppt/8b5688073252.jpg"],
    alt: `Dixville Notch mountain cliffs at sunset`,
  },
  echo_lake: {
    key: "echo_lake",
    urls: ["https://sfile.chatglm.cn/images-ppt/b7001e59b4ae.jpg", "https://sfile.chatglm.cn/images-ppt/5e91c49696e1.jpg", "https://sfile.chatglm.cn/images-ppt/6470cc09c198.jpg", "https://sfile.chatglm.cn/images-ppt/ea927bd42159.jpg"],
    alt: `Echo Lake Franconia Notch swimming beach`,
  },
  flume: {
    key: "flume",
    urls: ["https://sfile.chatglm.cn/images-ppt/7fab6aece1df.jpg", "https://sfile.chatglm.cn/images-ppt/a82062a635a8.jpg", "https://sfile.chatglm.cn/images-ppt/9b1a85127aa4.jpg", "https://sfile.chatglm.cn/images-ppt/f08cc436a06a.jpeg"],
    alt: `Flume Gorge waterfall boardwalk`,
  },
  forest_pine: {
    key: "forest_pine",
    urls: ["https://sfile.chatglm.cn/images-ppt/1cced2c3c5a2.jpg", "https://sfile.chatglm.cn/images-ppt/078b9737ddef.jpg", "https://sfile.chatglm.cn/images-ppt/b25b6c9723ab.jpg", "https://sfile.chatglm.cn/images-ppt/e813da3321e0.jpg", "https://sfile.chatglm.cn/images-ppt/0e03d527669d.jpeg"],
    alt: `Deep pine forest trail New England`,
  },
  granite_railway_real: {
    key: "granite_railway_real",
    urls: ["https://sfile.chatglm.cn/images-ppt/ce178990465a.jpg", "https://sfile.chatglm.cn/images-ppt/d694173107f7.jpg", "https://sfile.chatglm.cn/images-ppt/4bee4e4a0af6.jpg", "https://sfile.chatglm.cn/images-ppt/5472e9369c62.png", "https://sfile.chatglm.cn/images-ppt/957c6a68df1c.jpg"],
    alt: `Granite State Scenic Railway Lincoln NH train`,
  },
  hiking: {
    key: "hiking",
    urls: ["https://sfile.chatglm.cn/images-ppt/9f7024367bda.jpg", "https://sfile.chatglm.cn/images-ppt/07b4039f54ac.jpg", "https://sfile.chatglm.cn/images-ppt/68ab79af09fa.jpeg", "https://sfile.chatglm.cn/images-ppt/e1854303bff3.jpg", "https://sfile.chatglm.cn/images-ppt/1b29949abaac.jpg"],
    alt: `New England hiking trail forest`,
  },
  huntington_cascade_real: {
    key: "huntington_cascade_real",
    urls: ["https://sfile.chatglm.cn/images-ppt/4377c1b68e2e.jpg", "https://sfile.chatglm.cn/images-ppt/0d7d63a94d3d.jpg", "https://sfile.chatglm.cn/images-ppt/077c0ac23fd9.jpg", "https://sfile.chatglm.cn/images-ppt/93861e75261a.jpg"],
    alt: `Huntington Falls Colebrook waterfall`,
  },
  kancamagus_highway: {
    key: "kancamagus_highway",
    urls: ["https://sfile.chatglm.cn/images-ppt/6a0377c162ed.jpg", "https://sfile.chatglm.cn/images-ppt/657bd70b3845.jpg", "https://sfile.chatglm.cn/images-ppt/4b6036cfa1c1.jpg", "https://sfile.chatglm.cn/images-ppt/3e83ea2153d7.jpeg", "https://sfile.chatglm.cn/images-ppt/05f55f714c90.jpg"],
    alt: `Kancamagus Highway White Mountains scenic fall`,
  },
  lower_falls: {
    key: "lower_falls",
    urls: ["https://sfile.chatglm.cn/images-ppt/37b56c15d79c.jpg", "https://sfile.chatglm.cn/images-ppt/f6001daeaa19.jpg", "https://sfile.chatglm.cn/images-ppt/0796f12bb02a.jpg", "https://sfile.chatglm.cn/images-ppt/97d58781a84e.jpg"],
    alt: `Lower Falls Swift River Kancamagus swimming hole`,
  },
  moose: {
    key: "moose",
    urls: ["https://sfile.chatglm.cn/images-ppt/a219dd437fe8.jpg", "https://sfile.chatglm.cn/images-ppt/c20690d7ad38.jpg", "https://sfile.chatglm.cn/images-ppt/fce286ccbe5d.jpg", "https://sfile.chatglm.cn/images-ppt/87ba788f5fa8.jpg", "https://sfile.chatglm.cn/images-ppt/99255a949a2c.jpeg"],
    alt: `Wild moose in New Hampshire twilight`,
  },
  mtwashington: {
    key: "mtwashington",
    urls: ["https://sfile.chatglm.cn/images-ppt/fc783acb816d.jpg", "https://sfile.chatglm.cn/images-ppt/2e2710146ebd.jpg", "https://sfile.chatglm.cn/images-ppt/3828cce793a4.jpg", "https://sfile.chatglm.cn/images-ppt/3aa1cbfde3c4.jpg", "https://sfile.chatglm.cn/images-ppt/c87640031a1f.jpeg"],
    alt: `Mount Washington White Mountains summit`,
  },
  old_man_mountain: {
    key: "old_man_mountain",
    urls: ["https://sfile.chatglm.cn/images-ppt/4f1b1537a12d.jpg", "https://sfile.chatglm.cn/images-ppt/2fd1a3de0553.jpg", "https://sfile.chatglm.cn/images-ppt/f7fd125b413b.jpg", "https://sfile.chatglm.cn/images-ppt/4e95ca7892a6.jpg", "https://sfile.chatglm.cn/images-ppt/7f73bd868194.jpg"],
    alt: `Old Man of the Mountain Memorial Franconia Notch`,
  },
  pawtuckaway: {
    key: "pawtuckaway",
    urls: ["https://sfile.chatglm.cn/images-ppt/deae5cf97bd0.jpg", "https://sfile.chatglm.cn/images-ppt/9b89281fd9bf.jpg", "https://sfile.chatglm.cn/images-ppt/85d367607870.jpg", "https://sfile.chatglm.cn/images-ppt/178a08067cfb.jpg", "https://sfile.chatglm.cn/images-ppt/9752586e741d.jpg"],
    alt: `Pawtuckaway State Park lake and boulder beach`,
  },
  profile_lake: {
    key: "profile_lake",
    urls: ["https://sfile.chatglm.cn/images-ppt/f850ada79d74.jpg", "https://sfile.chatglm.cn/images-ppt/42d30ad6572b.jpg", "https://sfile.chatglm.cn/images-ppt/c708ec9541e9.jpg", "https://sfile.chatglm.cn/images-ppt/a55c39305a90.jpg", "https://sfile.chatglm.cn/images-ppt/4371b7005efc.jpg"],
    alt: `Profile Lake Franconia Notch Cannon Mountain`,
  },
  rocky_gorge: {
    key: "rocky_gorge",
    urls: ["https://sfile.chatglm.cn/images-ppt/27a4daf63170.jpg", "https://sfile.chatglm.cn/images-ppt/94e97e271430.jpg", "https://sfile.chatglm.cn/images-ppt/e25659c202a9.jpg", "https://sfile.chatglm.cn/images-ppt/1c2f1ea3a92c.jpg"],
    alt: `Rocky Gorge Kancamagus Highway scenic`,
  },
  sabbaday_falls: {
    key: "sabbaday_falls",
    urls: ["https://sfile.chatglm.cn/images-ppt/b1bc621175a9.jpg", "https://sfile.chatglm.cn/images-ppt/8a92b0025354.jpeg", "https://sfile.chatglm.cn/images-ppt/c6a24ac78ac4.jpg", "https://sfile.chatglm.cn/images-ppt/0f2569aef5ab.jpeg"],
    alt: `Sabbaday Falls Kancamagus Highway waterfall`,
  },
  stargazing: {
    key: "stargazing",
    urls: ["https://sfile.chatglm.cn/images-ppt/3a29f743cd0b.png", "https://sfile.chatglm.cn/images-ppt/5f251199e368.jpeg", "https://sfile.chatglm.cn/images-ppt/291a0fa6d217.jpg", "https://sfile.chatglm.cn/images-ppt/3bf2a3f2308f.jpg", "https://sfile.chatglm.cn/images-ppt/e2d24edb4902.jpg"],
    alt: `Milky Way night sky dark sky wilderness`,
  },
  sunset_lake: {
    key: "sunset_lake",
    urls: ["https://sfile.chatglm.cn/images-ppt/7afc9382246f.jpg", "https://sfile.chatglm.cn/images-ppt/9b9d968b6c8b.jpg", "https://sfile.chatglm.cn/images-ppt/25592456634a.jpeg", "https://sfile.chatglm.cn/images-ppt/b6d09b659d79.jpeg"],
    alt: `Mountain lake sunset golden hour reflection`,
  },
  table_rock: {
    key: "table_rock",
    urls: ["https://sfile.chatglm.cn/images-ppt/7591abd1587c.jpg", "https://sfile.chatglm.cn/images-ppt/8b2f568b4d0c.jpg", "https://sfile.chatglm.cn/images-ppt/6131892e5ce3.jpg", "https://sfile.chatglm.cn/images-ppt/bf53995cc08d.jpg"],
    alt: `Table Rock cliffs granite face Dixville Notch`,
  },
  the_basin: {
    key: "the_basin",
    urls: ["https://sfile.chatglm.cn/images-ppt/5d505e85c9f6.jpg", "https://sfile.chatglm.cn/images-ppt/532da447655f.jpg", "https://sfile.chatglm.cn/images-ppt/ce1aaa248f89.jpg", "https://sfile.chatglm.cn/images-ppt/ab8048d70921.jpg"],
    alt: `The Basin Franconia Notch glacial pothole waterfall`,
  },
  ring_full: {
    key: "ring_full",
    urls: ["https://sfile.chatglm.cn/images-ppt/b5179407e505.jpg", "https://sfile.chatglm.cn/images-ppt/d18c3c5c5448.jpg", "https://sfile.chatglm.cn/images-ppt/a61036b6ba08.jpg", "https://sfile.chatglm.cn/images-ppt/c5aa92ee8eb6.jpg", "https://sfile.chatglm.cn/images-ppt/08e14c298818.png"],
    alt: `Rose gold engagement ring with green gemstone and nature-inspired leaf design`,
  },
  ring_macro: {
    key: "ring_macro",
    urls: ["https://sfile.chatglm.cn/images-ppt/c77f93e081ed.jpg", "https://sfile.chatglm.cn/images-ppt/2210c13e6c12.jpg", "https://sfile.chatglm.cn/images-ppt/8df9cfdd8839.jpg", "https://sfile.chatglm.cn/images-ppt/a3cf25f639ff.jpg"],
    alt: `Macro close-up detail of engagement ring pavé diamonds and band craftsmanship`,
  },
};

/**
 * Get image URL by key. If no URLs available, returns null (caller should fallback to gradient).
 */
export function getImage(key: string, variant: number = 0): string | null {
  const entry = IMAGES[key];
  if (!entry || entry.urls.length === 0) return null;
  return entry.urls[variant % entry.urls.length];
}

/**
 * Get all image URLs for a set of keys (for galleries / carousels).
 */
export function getImages(keys: string[] = []): { key: string; url: string; alt: string }[] {
  const out: { key: string; url: string; alt: string }[] = [];
  for (const key of keys) {
    const entry = IMAGES[key];
    if (!entry) continue;
    for (const url of entry.urls) {
      out.push({ key, url, alt: entry.alt });
    }
  }
  return out;
}
