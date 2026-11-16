# Original 0.3 compatibility fixtures

These three progress files were generated and validated with the unmodified 0.3 engine before the 0.4 engine edit began. They contain synthetic fixture actions and explanations only. They are retained regression inputs, not student evidence.

- `0.3-address-transfer.json`: station 2's original address-based changed example, repaired and retested, before advancing.
- `0.3-complete-bootcamp.json`: all six original bootcamp checkpoints completed. Its station 2 transfer remains an address exercise; loading it must not invent the new physical-link task.
- `0.3-delivered-client.json`: an original frozen client delivery, not yet paid. Loading, free practice, resuming and settlement must preserve that frozen snapshot and its original fee.

The fixtures were captured through the ordinary pre-edit `createGame`, `dispatch`, `completeTrainingStage` and `client` test helpers; each passed the original `validateSave` before being written.
