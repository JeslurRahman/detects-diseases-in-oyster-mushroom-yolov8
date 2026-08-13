/**
 * download.ts — download a backend-generated report to a local file and open
 * the share sheet. Used for PDF (Detail + History) and CSV export.
 */
// SDK 54 introduced a new expo-file-system API; downloadAsync/cacheDirectory
// live in the stable legacy entry point.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface DownloadResult {
  uri: string;
  shared: boolean;
}

/**
 * Downloads `url` to a cache file named `filename`, then opens the share sheet
 * (which also allows "Save to Files" / printing on both platforms).
 */
export async function downloadAndShare(
  url: string,
  filename: string,
  mimeType = 'application/pdf',
): Promise<DownloadResult> {
  const target = `${FileSystem.cacheDirectory}${filename}`;
  const { uri } = await FileSystem.downloadAsync(url, target);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType,
      dialogTitle: 'Share report',
      UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
    });
    return { uri, shared: true };
  }
  return { uri, shared: false };
}
