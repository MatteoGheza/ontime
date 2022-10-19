import { IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip } from '@chakra-ui/react';
import { FiClock } from '@react-icons/all-files/fi/FiClock';
import { FiMinusCircle } from '@react-icons/all-files/fi/FiMinusCircle';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';

import { tooltipDelayMid } from '../../../ontimeConfig';

interface ActionButtonProps {
  showAdd?: boolean;
  showDelay?: boolean;
  showBlock?: boolean;
  actionHandler: (action: string) => void;
}

export default function ActionButtons(props: ActionButtonProps) {
  const { showAdd, showDelay, showBlock, actionHandler } = props;

  const menuStyle = {
    color: '#000000',
    backgroundColor: 'rgba(255,255,255,1)',
  };

  return (
    <Menu isLazy lazyBehavior='unmount'>
      <Tooltip label='Add ...' openDelay={tooltipDelayMid}>
        <MenuButton
          as={IconButton}
          aria-label='Options'
          size='xs'
          icon={<FiPlus />}
          colorScheme='blue'
        />
      </Tooltip>
      <MenuList style={menuStyle}>
        <MenuItem icon={<FiPlus />} onClick={() => actionHandler('event')} isDisabled={!showAdd}>
          Add Event after
        </MenuItem>

        <MenuItem icon={<FiClock />} onClick={() => actionHandler('delay')} isDisabled={!showDelay}>
          Add Delay after
        </MenuItem>
        <MenuItem
          icon={<FiMinusCircle />}
          onClick={() => actionHandler('block')}
          isDisabled={!showBlock}
        >
          Add Block after
        </MenuItem>
      </MenuList>
    </Menu>
  );
}