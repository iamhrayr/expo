import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { StyledText } from '../components/Text';
import { StyledView } from '../components/Views';
import Colors from '../constants/Colors';

type Props = {
  appInfo: {
    appName: string;
    appVersion: string;
    appIcon?: string;
    packagerUrl?: string;

    manifest?: {
      iconUrl: string;
      sdkVersion: string;
    };
  };
};

class DevMenuAppInfo extends React.PureComponent<Props, any> {
  render() {
    const { appInfo } = this.props;

    if (!appInfo) {
      return null;
    }

    const { appName, appVersion, packagerUrl } = appInfo;
    const iconUrl = appInfo.appIcon ?? appInfo.manifest?.iconUrl;
    const sdkVersion = appInfo.manifest?.sdkVersion;

    return (
      <View style={styles.appInfoContainer}>
        <View style={styles.appIconColumn}>
          {iconUrl ? (
            <Image source={{ uri: iconUrl }} style={styles.appIcon} />
          ) : (
            <AppIconPlaceholder />
          )}
        </View>
        <View style={styles.appInfoColumn}>
          <View style={styles.appInfoRow}>
            <StyledText style={styles.appName} numberOfLines={1}>
              {appName ?? 'Untitled project'}
            </StyledText>
          </View>
          <AppInfoRow name="Version" value={appVersion} />
          <AppInfoRow
            name="Packager"
            value={packagerUrl?.replace(/^\w+:\/\//, '').replace(/\/.*$/, '')}
          />
          <AppInfoRow name="SDK" value={sdkVersion} />
        </View>
      </View>
    );
  }
}

function AppIconPlaceholder() {
  return (
    <StyledView
      style={[styles.appIcon, styles.appIconPlaceholder]}
      lightBackgroundColor={Colors.light.appIconPlaceholderBackground}
      darkBackgroundColor={Colors.dark.appIconPlaceholderBackground}
      lightBorderColor={Colors.light.appIconPlaceholderBorder}
      darkBorderColor={Colors.dark.appIconPlaceholderBorder}
    />
  );
}

function AppInfoStyledText(props) {
  return (
    <StyledText
      style={props.style}
      lightColor={Colors.light.secondaryText}
      darkColor={Colors.dark.secondaryText}>
      {props.children}
    </StyledText>
  );
}

function AppInfoRow({ name, value }: { name: string; value?: string }) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.appInfoRow}>
      <AppInfoStyledText style={styles.appInfoKey} numberOfLines={1}>
        {name}:
      </AppInfoStyledText>
      <AppInfoStyledText style={styles.appInfoValue} numberOfLines={1}>
        {value}
      </AppInfoStyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  appInfoContainer: {
    flexDirection: 'row',
    padding: 14,
  },
  appIconColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  appInfoKey: {
    fontWeight: '700',
    fontSize: 10,
    marginRight: 5,
  },
  appInfoValue: {
    fontSize: 10,
  },
  appIcon: {
    width: 52,
    height: 52,
    alignSelf: 'center',
    borderRadius: 10,
  },
  appIconPlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  packagerIndicator: {
    marginRight: 5,
  },
});

export default DevMenuAppInfo;
