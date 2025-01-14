'use client';

import PropTypes from 'prop-types';
import ChannelMembers from './ChannelMembers';

export default function RightSidebar({ type = 'channel', channelId }) {
  if (type !== 'channel' || !channelId) {
    return null;
  }

  return (
    <div className="flex h-full flex-col border-l border-border">
      <ChannelMembers channelId={channelId} />
    </div>
  );
}

RightSidebar.propTypes = {
  type: PropTypes.oneOf(['channel', 'dm']),
  channelId: PropTypes.string,
};

RightSidebar.defaultProps = {
  type: 'channel',
  channelId: undefined,
}; 