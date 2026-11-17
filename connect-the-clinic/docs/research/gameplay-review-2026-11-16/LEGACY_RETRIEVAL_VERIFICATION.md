# Aspire reference copy — retrieval and verification

**16 November 2026 (America/Halifax) · completed file retrieval and static inspection**

## Outcome

The lead retrieved the actual community-linked Academy ZIP through its normal public Google Drive download form. The teacher subsequently supplied a second ZIP. Both contain version **1.1.6.28**. All **4,402 game files** in the retrieved archive have matching SHA-256 content hashes in the teacher's upload. The upload also contains macOS archive metadata. Both ZIP integrity checks passed.

This resolves the earlier missing-file blocker. It does not establish publisher authenticity, malware clearance, runtime compatibility or successful play. No executable or bundled installer was launched.

## Archive receipts

| Item | Retrieved reference | Teacher-supplied ZIP |
| --- | --- | --- |
| Filename | `Cisco-Aspire-Networking-Academy-Edition.zip` | `Cisco Aspire Networking Academy Edition.zip` |
| Compressed bytes | 369,136,692 | 371,133,953 |
| SHA-256 | `0e34666f38f643d945afd8eafa5036f98aad50d3defa8256c459f633e848e727` | `1a64ba2f70e05b26b9504d09c05cc1c1f1ef36858a154166001dd678873c5c65` |
| File entries excluding directories | 4,402 | 9,080 including metadata |
| Expanded bytes | 483,832,693 | 484,824,429 including metadata |
| Packaged version | `bin/VERSION`: 1.1.6.28 | Same |
| ZIP CRC test | Passed every file | Passed every file |
| Common payload comparison | 4,402 files compared | Zero SHA-256 content mismatches |

Source: [Speedrun Academy resource](https://www.speedrun.com/canae/resources/8ruu1), which links to the [Google Drive candidate](https://drive.google.com/file/d/1_Ix_mr0A8pMQg9d4Nx02EJGhAxy1Pzel/view?usp=sharing). The separately supplied upload is retained as the teacher-provided reference. The binary archives and extracted inspection images are not part of the public game repository.

## What was actually verified

- Metadata supplied a 369,136,692-byte archive. The complete retrieved byte count matches it.
- The Drive connector's 256 MiB file limit prevented that transfer route. The file's ordinary public download form then delivered the full ZIP; no account login or access-control bypass was used.
- The normal download page warned that the file was too large for Google's virus scan. The file was downloaded for static inspection; no claim of a passed virus scan follows.
- The original archive's paths contained no absolute or parent-directory traversal entries. No whole-package extraction was needed.
- `bin/aspire.exe` is a 40,567,296-byte Windows x86 PE executable. Its PE certificate-table fields are zero; no embedded Authenticode signature was available to establish publisher authenticity.
- The package contains 44 `.fsm` state-machine files and 37 `.pka` activity files, alongside scene images, equipment artwork, help, data files and libraries. These counts describe files, not playable level counts.
- The package includes Qt 4 libraries and a Flash installer. Their presence does not establish which runtime features need them or whether a modern Windows launch succeeds.

## Research now completed

The [package findings](LEGACY_PACKAGE_FINDINGS.md) inspect readable state-machine structure. The [visual findings](LEGACY_VISUAL_ARCHITECTURE.md) inspect selected source images and compare them with the clinic. The [original blueprint](ORIGINAL_GAME_BLUEPRINT.md) converts those observations into new architecture and implementation priorities. The [Digital Society scenario plan](DS_SCENARIO_HARNESS.md) covers hardware, security, media and health extensions.

No source scripts, dialogue, maps or graphics were imported into our runtime. No automatic curriculum/grade conclusions were made. The published clinic remains the existing 0.6.0 review build.

## Still untested

Actual legacy startup and normal play; reachability and timing of packaged branches; exact economic amounts; all underlying networking checks; save/activation behaviour; and school-device compatibility. Some adjacent data files are opaque in the sampled static reads. These are limits of this inspection, not evidence that those systems do not exist.
