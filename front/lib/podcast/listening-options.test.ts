import assert from "node:assert/strict";
import test from "node:test";
import type { Podcast } from "../sanity/types";
import { getEpisodeDownloadUrl, getListeningOptions } from "./listening-options";

const assetUrl = "https://cdn.sanity.io/files/project/production/episode.mp3";
const podcast: Podcast = {
  _id: "episode",
  title: "Un épisode",
  slug: "un-episode",
  description: "",
  publishedAt: "2026-11-11",
  episodeNumber: 12,
  audioFile: { asset: { url: assetUrl } },
};

test("downloads go directly to Sanity with a filename, while playback keeps the original URL", () => {
  const options = getListeningOptions(podcast);
  assert.equal(options.downloadUrl, `${assetUrl}?dl=tomberry-ep12.mp3`);
  assert.deepEqual(options.inlinePlayers, [{ id: "mp3", label: "MP3", audioUrl: assetUrl }]);
});

test("original filenames with accents, spaces and URL delimiters round-trip", () => {
  const filename = "Épisode 12 — été & musique #1?.mp3";
  const url = getEpisodeDownloadUrl({
    ...podcast,
    audioFile: { asset: { url: assetUrl, originalFilename: filename } },
  });
  assert.ok(url);
  assert.equal(new URL(url).searchParams.get("dl"), filename);
});

test("download links preserve existing query parameters and replace dl", () => {
  const url = getEpisodeDownloadUrl({
    ...podcast,
    audioFile: { asset: { url: `${assetUrl}?token=example&dl=old.mp3` } },
  });
  assert.ok(url);
  assert.equal(new URL(url).searchParams.get("token"), "example");
  assert.deepEqual(new URL(url).searchParams.getAll("dl"), ["tomberry-ep12.mp3"]);
});

test("filename falls back to the slug when there is no episode number", () => {
  assert.equal(
    getEpisodeDownloadUrl({ ...podcast, episodeNumber: undefined }),
    `${assetUrl}?dl=tomberry-un-episode.mp3`,
  );
});

test("an episode without a file has no download link and retains its other listening options", () => {
  const options = getListeningOptions({ ...podcast, audioFile: undefined, youtube: "https://youtube.com/watch?v=episode" });
  assert.equal(options.downloadUrl, null);
  assert.deepEqual(options.inlinePlayers, []);
  assert.equal(options.externalLinks[0].id, "youtube");
});
