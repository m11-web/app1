import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, getThemeColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const CLOUD_NAME =
  (process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME as string) || 'feyqjqhr';
const UPLOAD_PRESET =
  (process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string) || 'ml_default';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  height?: number;
}

async function uploadToCloudinary(uri: string): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, ImagePicker gives a data URI — Cloudinary accepts it directly
    formData.append('file', uri);
  } else {
    const filename = uri.split('/').pop() || 'image.jpg';
    const ext = /\.(\w+)$/.exec(filename)?.[1] ?? 'jpg';
    (formData as any).append('file', { uri, name: filename, type: `image/${ext}` });
  }

  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
  return data.secure_url as string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
  height = 160,
}: Props) {
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = async () => {
    setError('');

    // On web, permissions are always granted (browser handles it)
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError('Gallery permission is needed to upload images.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const url = await uploadToCloudinary(asset.uri);
      onChange(url);
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: tc.textSec }]}>{label}</Text>

      <TouchableOpacity
        onPress={handlePick}
        disabled={uploading}
        activeOpacity={0.85}
        style={[
          styles.box,
          { height, backgroundColor: tc.inputBg, borderColor: tc.border },
        ]}
      >
        {/* Preview or placeholder */}
        {value ? (
          <Image source={{ uri: value }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.camIcon}>📷</Text>
            <Text style={[styles.placeholderTxt, { color: tc.textSec }]}>
              Tap to pick & upload image
            </Text>
          </View>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <View style={styles.overlay}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.overlayTxt}>Uploading to Cloudinary…</Text>
          </View>
        )}

        {/* Action badge (bottom-right) */}
        {!uploading && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>
              {value ? '✏️  Change Image' : '⬆️  Upload Image'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {!!error && (
        <Text style={styles.error}>⚠️  {error}</Text>
      )}
      {!error && !!value && (
        <Text style={[styles.success, { color: COLORS.green500 }]}>
          ✅  Image uploaded successfully
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  box: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { alignItems: 'center', gap: 8 },
  camIcon: { fontSize: 36 },
  placeholderTxt: { fontSize: 13, fontWeight: '500' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  overlayTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  badge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  error: { color: COLORS.red500, fontSize: 12 },
  success: { fontSize: 12, fontWeight: '600' },
});
