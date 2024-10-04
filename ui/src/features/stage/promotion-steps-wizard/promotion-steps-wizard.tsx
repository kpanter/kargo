import { faAdd, faCaretDown, faCaretUp, faCog, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tag } from 'antd';
import Card from 'antd/es/card/Card';
import classNames from 'classnames';
import { useState } from 'react';

import { usePromotionDirectivesRegistryContext } from '@ui/features/promotion-directives/registry/context/use-registry-context';

import { PromotionStepForm } from './promotion-step-form';
import { RunnerWithConfiguration } from './types';

export type PromotionStepsWizardType = {
  // let the YAML -> state transformation dance delegate to component up in the tree
  steps: RunnerWithConfiguration[];
  onChange: (newStepsState: RunnerWithConfiguration[]) => void;
};

export const PromotionStepsWizard = (props: PromotionStepsWizardType) => {
  const { registry } = usePromotionDirectivesRegistryContext();

  const selectedRunners = props.steps;
  const setSelectedRunners = props.onChange;

  const [editingRunner, setEditingRunner] = useState<
    (RunnerWithConfiguration & { order: number }) | undefined
  >();

  const liveEditingRunner: RunnerWithConfiguration | undefined =
    editingRunner && selectedRunners?.find((_, idx) => idx === editingRunner?.order);

  return (
    <div>
      {/* AVAILABLE RUNNERS - TODO(Marvin9) add search functionality */}
      <div className='flex gap-2 flex-wrap'>
        {registry.runners
          // .filter((runner) => !selectedRunners.find((r) => r.identifier === runner.identifier))
          // .slice(0, 5)
          .map((runner, idx) => (
            <Tag
              className='cursor-pointer'
              key={runner.identifier + idx}
              onClick={() => {
                setSelectedRunners([...selectedRunners, runner]);
              }}
              icon={<FontAwesomeIcon className='mr-2' icon={faAdd} />}
            >
              {runner.identifier}
            </Tag>
          ))}
      </div>

      {/* SELECTED RUNNERS */}
      {selectedRunners.length > 0 && (
        <div className='flex gap-5 relative'>
          <div className='mt-5 space-y-4 w-4/12'>
            {selectedRunners.map((runner, order) => {
              const onSettingOpen = () => {
                setEditingRunner({ ...runner, order });
              };

              const isEditingThisRunner = editingRunner?.order === order;

              return (
                <Card
                  key={`${runner.identifier}-${order}-${runner?.as}`}
                  className={classNames('cursor-pointer', {
                    'shadow-sm': isEditingThisRunner,
                    'border-gray-400': isEditingThisRunner
                  })}
                  size='small'
                  onClick={onSettingOpen}
                >
                  <div className='flex items-center gap-5'>
                    <div className='flex flex-col gap-5 text-2xl cursor-pointer'>
                      {order > 0 && (
                        <FontAwesomeIcon
                          icon={faCaretUp}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newOrder = [...selectedRunners];
                            newOrder[order] = selectedRunners[order - 1];
                            newOrder[order - 1] = runner;
                            setSelectedRunners(newOrder);
                            setEditingRunner({ ...runner, order: order - 1 });
                          }}
                        />
                      )}
                      {order < selectedRunners.length - 1 && (
                        <FontAwesomeIcon
                          icon={faCaretDown}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newOrder = [...selectedRunners];
                            newOrder[order] = selectedRunners[order + 1];
                            newOrder[order + 1] = runner;
                            setSelectedRunners(newOrder);
                            setEditingRunner({ ...runner, order: order + 1 });
                          }}
                        />
                      )}
                    </div>

                    <span className='font-semibold'>
                      {order + 1} - {runner.identifier}
                    </span>

                    {!!runner?.as && (
                      <Tag className='text-xs max-w-20 overflow-hidden ml-auto' color='blue'>
                        {runner.as}
                      </Tag>
                    )}

                    <div className={classNames('space-x-4', { 'ml-auto': !runner?.as })}>
                      <Button icon={<FontAwesomeIcon icon={faCog} />} onClick={onSettingOpen} />
                      <Button
                        icon={<FontAwesomeIcon icon={faTrash} className='text-red-500' />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRunners(
                            selectedRunners.filter((_, deleteOrder) => deleteOrder !== order)
                          );
                        }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {editingRunner && liveEditingRunner && (
            <Card
              color='lightgray'
              className='w-8/12 mt-5 h-fit sticky top-0'
              size='small'
              title={
                <>
                  <FontAwesomeIcon icon={faCog} className='mr-2' />
                  {editingRunner.order + 1} - {liveEditingRunner.identifier}{' '}
                  {liveEditingRunner?.as && (
                    <Tag color='blue' className='ml-4'>
                      {liveEditingRunner.as}
                    </Tag>
                  )}
                </>
              }
            >
              <PromotionStepForm
                selectedRunner={liveEditingRunner}
                patchSelectedRunner={(nextRunner) => {
                  setSelectedRunners(
                    selectedRunners.map((localRunner, localOrder) => {
                      if (editingRunner?.order === localOrder) {
                        return {
                          ...localRunner,
                          ...nextRunner
                        };
                      }

                      return localRunner;
                    })
                  );
                }}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
