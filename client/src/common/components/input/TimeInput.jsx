import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { IconButton, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { IoLink } from '@react-icons/all-files/io5/IoLink';
import { LoggingContext } from 'common/context/LoggingContext';
import { forgivingStringToMillis } from 'common/utils/dateConfig';
import { stringFromMillis } from 'common/utils/time';
import PropTypes from 'prop-types';

import style from './TimeInput.module.scss';

export default function TimeInput(props) {
  const { name, submitHandler, time = 0, delay, placeholder, validationHandler, previousEnd } = props;
  const { emitError } = useContext(LoggingContext);
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  /**
   * @description Resets input value to given
   */
  const resetValue = useCallback(() => {
    // Todo: check if change is necessary
    try {
      setValue(stringFromMillis(time + delay));
    } catch (error) {
      emitError(`Unable to parse date: ${error.text}`);
    }
  }, [delay, emitError, time]);

  /**
   * @description Selects input text on focus
   */
  const handleFocus = useCallback(() => {
    inputRef.current.select();
  }, []);

  /**
   * @description Submit handler
   * @param {string} newValue
   */
  const handleSubmit = useCallback(
    (newValue) => {
      // Check if there is anything there
      if (newValue === '') {
        return false;
      }

      let newValMillis = 0;

      // check for known aliases
      if (newValue === 'p' || newValue === 'prev' || newValue === 'previous') {
        // string to pass should be the time of the end before
        if (previousEnd != null) {
          newValMillis = previousEnd;
        }
      } else if (
        newValue.startsWith('+') ||
        newValue.startsWith('p+') ||
        newValue.startsWith('p +')
      ) {
        // string to pass should add to the end before
        const val = newValue.substring(1);
        newValMillis = previousEnd + forgivingStringToMillis(val);
      } else {
        // convert entered value to milliseconds
        newValMillis = forgivingStringToMillis(newValue);
      }

      // Time now and time submittedVal
      const originalMillis = time + delay;

      // check if time is different from before
      if (newValMillis === originalMillis) return false;

      // validate with parent
      if (!validationHandler(name, newValMillis)) return false;

      // update entry
      submitHandler(name, newValMillis);

      return true;
    },
    [delay, name, previousEnd, submitHandler, time, validationHandler]
  );

  /**
   * @description Prepare time fields
   * @param {string} value string to be parsed
   */
  const validateAndSubmit = useCallback(
    (newValue) => {
      const success = handleSubmit(newValue);
      if (success) {
        const ms = forgivingStringToMillis(newValue);
        setValue(stringFromMillis(ms + delay));
      } else {
        resetValue();
      }
    },
    [delay, handleSubmit, resetValue]
  );

  /**
   * @description Handles common keys for submit and cancel
   * @param {KeyboardEvent} event
   */
  const onKeyDownHandler = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        inputRef.current.blur();
        validateAndSubmit(event.target.value);
      } else if (event.key === 'Tab') {
        validateAndSubmit(event.target.value);
      }
      if (event.key === 'Escape') {
        inputRef.current.blur();
        resetValue();
      }
    },
    [resetValue, validateAndSubmit]
  );

  useEffect(() => {
    if (time == null) return;
    resetValue();
  }, [emitError, resetValue, time]);

  const isDelayed = delay != null && delay !== 0;

  return (
    <InputGroup size='sm' className={`${style.timeInput} ${isDelayed ? style.delayed : ''}`}>
      <InputLeftElement width='fit-content'>
        <IconButton
          size='sm'
          icon={<IoLink style={{ transform: 'rotate(-45deg)' }} />}
          aria-label='automate'
          colorScheme='blue'
          style={{ borderRadius: '2px', width: 'min-content' }}
          tabIndex={-1}
        />
      </InputLeftElement>
      <Input
        ref={inputRef}
        data-testid='time-input'
        className={style.inputField}
        type='text'
        placeholder={placeholder}
        variant='filled'
        onFocus={handleFocus}
        onChange={(event) => setValue(event.target.value)}
        onBlur={resetValue}
        onKeyDown={onKeyDownHandler}
        value={value}
        maxLength={8}
      />
    </InputGroup>
  );
}

TimeInput.propTypes = {
  name: PropTypes.string,
  submitHandler: PropTypes.func,
  time: PropTypes.number,
  delay: PropTypes.number,
  placeholder: PropTypes.string,
  validationHandler: PropTypes.func,
  previousEnd: PropTypes.number,
};