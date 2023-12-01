import { Control, useFieldArray, UseFormRegister } from 'react-hook-form';
import { Button, IconButton, Input, Switch } from '@chakra-ui/react';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { IoRemove } from '@react-icons/all-files/io5/IoRemove';
import { HttpSettings, TimerLifeCycle } from 'ontime-types';

import { useEmitLog } from '../../../../common/stores/logger';
import { startsWithHttp } from '../../../../common/utils/regex';

import collapseStyles from '../../../../common/components/collapse-bar/CollapseBar.module.scss';
import styles from '../../Modal.module.scss';

interface SubscriptionRowProps {
  cycle: TimerLifeCycle;
  title: string;
  subtitle: string;
  visible: boolean;
  setShowSection: (cycle: TimerLifeCycle) => void;
  register: UseFormRegister<HttpSettings>;
  control: Control<HttpSettings>;
  placeholder: string;
}

export default function SubscriptionRow(props: SubscriptionRowProps) {
  const { cycle, title, subtitle, visible, setShowSection, register, control, placeholder } = props;
  const { emitError } = useEmitLog();
  const { fields, append, remove } = useFieldArray({
    name: `subscriptions.${cycle}`,
    control,
  });

  const hasTooManyOptions = fields.length >= 3;
  const headerStyle = `${styles.splitSection} ${visible ? '' : styles.showPointer}`;

  const sectionTitle = `${title} ${fields.length ? fields.length : '-'} / 3`;

  const handleAddNew = () => {
    if (hasTooManyOptions) {
      emitError('Maximum amount of onLoad subscriptions reached (3)');
      return;
    }
    append({
      message: '',
      enabled: false,
    });
  };

  return (
    <>
      <div className={headerStyle} onClick={() => setShowSection(cycle)}>
        <div>
          <span className={`${styles.sectionTitle} ${styles.main}`}>{sectionTitle}</span>
          {visible && <span className={styles.sectionSubtitle}>{subtitle}</span>}
        </div>
        <FiChevronUp className={visible ? collapseStyles.moreCollapsed : collapseStyles.moreExpanded} />
      </div>
      {visible && (
        <>
          {fields.map((subscription, index) => (
            <div key={subscription.id} className={styles.entryRow}>
              <IconButton
                icon={<IoRemove />}
                onClick={() => remove(index)}
                aria-label='delete'
                size='xs'
                colorScheme='red'
              />
              <Input
                placeholder={placeholder}
                size='xs'
                variant='ontime-filled-on-light'
                autoComplete='off'
                {...register(`subscriptions.${cycle}.${index}.message`, {
                  pattern: { value: startsWithHttp, message: 'Request address must start with http://' },
                })}
              />
              <Switch variant='ontime-on-light' {...register(`subscriptions.${cycle}.${index}.enabled`)} />
            </div>
          ))}
          <Button
            onClick={handleAddNew}
            className={styles.shiftRight}
            isDisabled={hasTooManyOptions}
            size='xs'
            colorScheme='blue'
            variant='outline'
            padding='0 2em'
          >
            Add new
          </Button>
        </>
      )}
    </>
  );
}
