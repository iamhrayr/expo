import React from 'react';
import { Clipboard, StyleSheet, PixelRatio, View } from 'react-native';

import DevMenuContext, { Context } from '../DevMenuContext';
import * as DevMenuInternal from '../DevMenuInternal';
import { StyledText } from '../components/Text';
import { StyledView } from '../components/Views';
import Colors from '../constants/Colors';
import DevMenuItemsList from './DevMenuItemsList';
import DevMenuAppInfo from './DevMenuAppInfo';

type Props = {
  appInfo: { [key: string]: any };
  uuid: string;
  devMenuItems: DevMenuInternal.DevMenuItemAnyType[];
  enableDevelopmentTools: boolean;
  showOnboardingView: boolean;
};

class DevMenuView extends React.PureComponent<Props, undefined> {
  static contextType = DevMenuContext;

  context!: Context;

  collapse = () => {
    this.context?.collapse?.();
  };

  onCopyTaskUrl = () => {
    const { manifestUrl } = this.props.appInfo;

    this.collapse();
    Clipboard.setString(manifestUrl);
    alert(`Copied "${manifestUrl}" to the clipboard!`);
  };

  renderItems() {
    return <DevMenuItemsList items={this.context.devMenuItems} />;
  }

  renderContent() {
    const { appInfo } = this.props;

    return (
      <>
        <StyledView
          style={styles.appInfo}
          lightBackgroundColor={Colors.light.secondaryBackground}
          darkBackgroundColor={Colors.dark.secondaryBackground}>
          <DevMenuAppInfo appInfo={appInfo} />
        </StyledView>

        <View style={styles.itemsContainer}>{this.renderItems()}</View>
      </>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderContent()}
        {/* Enable this to test scrolling
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()} */}

        <View style={styles.footer}>
          <StyledText
            style={styles.footerText}
            lightColor={Colors.light.grayText}
            darkColor={Colors.dark.grayText}>
            This development menu will not be present in any release builds of this project.
          </StyledText>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appInfo: {
    borderBottomWidth: 2 / PixelRatio.get(),
  },
  itemsContainer: {
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 3, // should be higher than zIndex of onboarding container
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
  },
});

export default DevMenuView;
