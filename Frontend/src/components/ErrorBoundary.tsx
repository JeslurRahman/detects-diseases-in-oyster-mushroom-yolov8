/**
 * ErrorBoundary — catches render crashes so the app shows a recoverable message
 * instead of unmounting to a blank screen.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#F7F8F5',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#2E2E2E' }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#77806F', textAlign: 'center' }}>
            {this.state.error.message}
          </Text>
          <Pressable
            onPress={this.reset}
            style={{
              backgroundColor: '#3E5D46',
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 24,
              marginTop: 8,
            }}
          >
            <Text style={{ color: '#FDFEFB', fontWeight: '700' }}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
