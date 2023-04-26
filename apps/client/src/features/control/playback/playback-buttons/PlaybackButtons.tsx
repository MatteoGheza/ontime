import { Tooltip } from '@chakra-ui/react';
import { IoPause } from '@react-icons/all-files/io5/IoPause';
import { IoPlay } from '@react-icons/all-files/io5/IoPlay';
import { IoPlaySkipBack } from '@react-icons/all-files/io5/IoPlaySkipBack';
import { IoPlaySkipForward } from '@react-icons/all-files/io5/IoPlaySkipForward';
import { IoReload } from '@react-icons/all-files/io5/IoReload';
import { IoStop } from '@react-icons/all-files/io5/IoStop';
import { IoTimeOutline } from '@react-icons/all-files/io5/IoTimeOutline';
import { Playback } from 'ontime-types';

import { setPlayback } from '../../../../common/hooks/useSocket';
import { tooltipDelayMid } from '../../../../ontimeConfig';
import TapButton from '../tap-button/TapButton';

import styles from './PlaybackButtons.module.scss';
import style from './PlaybackButtons.module.scss';

interface PlaybackButtonsProps {
  playback: Playback;
  numEvents: number;
  selectedEventIndex: number | null;
}

export default function PlaybackButtons(props: PlaybackButtonsProps) {
  const { playback, numEvents, selectedEventIndex } = props;

  const isRolling = playback === Playback.Roll;
  const isPlaying = playback === Playback.Play;
  const isPaused = playback === Playback.Pause;
  const isArmed = playback === Playback.Armed;
  const isStopped = playback === Playback.Stop;

  const isFirst = selectedEventIndex === 0;
  const isLast = selectedEventIndex === numEvents - 1;
  const noEvents = numEvents === 0;

  const disableGo = isRolling || noEvents || isLast;
  const disablePrev = isRolling || noEvents || isFirst;

  return (
    <div className={styles.buttonContainer}>
      <TapButton disabled={disableGo} onClick={() => setPlayback.startNext()} aspect='fill' className={styles.go}>
        GO
      </TapButton>
      <div className={style.playbackContainer}>
        <TapButton
          onClick={() => setPlayback.start()}
          disabled={isStopped || isRolling}
          theme={Playback.Play}
          active={isPlaying}
        >
          <IoPlay />
        </TapButton>

        <TapButton
          onClick={() => setPlayback.pause()}
          disabled={isStopped || isRolling || isArmed}
          theme={Playback.Pause}
          active={isPaused}
        >
          <IoPause />
        </TapButton>
      </div>
      <div className={style.transportContainer}>
        <Tooltip label='Previous event' openDelay={tooltipDelayMid}>
          <TapButton onClick={() => setPlayback.previous()} disabled={disablePrev}>
            <IoPlaySkipBack />
          </TapButton>
        </Tooltip>
        <Tooltip label='Next event' openDelay={tooltipDelayMid}>
          <TapButton onClick={() => setPlayback.next()} disabled={disableGo}>
            <IoPlaySkipForward />
          </TapButton>
        </Tooltip>
      </div>
      <div className={styles.extra}>
        <TapButton
          onClick={() => setPlayback.roll()}
          disabled={!isStopped || noEvents}
          theme={Playback.Roll}
          active={isRolling}
        >
          <IoTimeOutline />
        </TapButton>
        <Tooltip label='Reload event' openDelay={tooltipDelayMid}>
          <TapButton onClick={() => setPlayback.reload()} disabled={isStopped || isRolling}>
            <IoReload className={style.invertX} />
          </TapButton>
        </Tooltip>
        <Tooltip label='Unload Event' openDelay={tooltipDelayMid}>
          <TapButton onClick={() => setPlayback.stop()} disabled={isStopped && !isRolling} theme={Playback.Stop}>
            <IoStop />
          </TapButton>
        </Tooltip>
      </div>
    </div>
  );
}