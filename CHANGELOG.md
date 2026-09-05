# Changelog

## 1.0.0 (2026-09-05)


### Features

* add addCard with hover effects and use across card scenes ([d20c0f9](https://github.com/remarkablegames/battlemon/commit/d20c0f94e7c33845f87d86b2dc7cc4c27f1dbcce))
* add battle enhancements, tame/sell mechanic, and shop system ([c2d7098](https://github.com/remarkablegames/battlemon/commit/c2d7098fdb00761e78749611ba1cfc7b97746c30))
* add battle roster selection and team ordering ([a003e62](https://github.com/remarkablegames/battlemon/commit/a003e62f9a79aa010ff4c2eaf7bc67603ec9fd34))
* add bench slots panel to HUD ([c534c85](https://github.com/remarkablegames/battlemon/commit/c534c85a29d93f62be8196d14df8fd6ec11c7ce8))
* add GBA-style battle background and dark canvas clear color ([66ad59f](https://github.com/remarkablegames/battlemon/commit/66ad59f746398ef13ca246d05e67107eafb4acf7))
* add monster XP and level up system ([e1ee04b](https://github.com/remarkablegames/battlemon/commit/e1ee04b9ff22acfcdac831ac6ffb085ebdd10e41))
* add rounded corners, hover cursor, and color brighten on buttons ([5db307d](https://github.com/remarkablegames/battlemon/commit/5db307d9a10c8a6bcc616aba18dc664c90efcf3a))
* clock sweep cooldown overlay for bench monsters ([01fcd18](https://github.com/remarkablegames/battlemon/commit/01fcd182cb3e444ff136dfcfc8b190140965383f))
* implement Battlemon autobattler with mobile-first UI ([0dd7e96](https://github.com/remarkablegames/battlemon/commit/0dd7e960fb921f63f5adce6a41a083aafcf98d3f))
* monster selection overlay for shop stat boosts ([9dd1a8e](https://github.com/remarkablegames/battlemon/commit/9dd1a8e816da8e5d44feb25dd484b83a2467f9a1))
* preview enemies and improve tame/shop ([184247b](https://github.com/remarkablegames/battlemon/commit/184247b70cfcc25416e57edcfb2bca408224347d))
* replace screen shake with damage-scaled sprite shake on hit ([b201ca5](https://github.com/remarkablegames/battlemon/commit/b201ca5f41351f59083fc2dec911e5d13e43445f))
* scale button to 1.05x on hover ([9684152](https://github.com/remarkablegames/battlemon/commit/9684152b8dcc80efb6350329b0c31c341935011d))
* show not-allowed cursor on disabled button hover ([023dc93](https://github.com/remarkablegames/battlemon/commit/023dc938890a844781f1d554e14ee84fa9f86cf0))
* tappable bench slots for monster swapping ([006c153](https://github.com/remarkablegames/battlemon/commit/006c153b73ecb806f9a226d7bcc0ed16ea8531c9))
* use kaplay-plugin-text styledText for outlined text ([94fc69d](https://github.com/remarkablegames/battlemon/commit/94fc69d3394ee64468e9f754db9bd943996856e9))


### Bug Fixes

* adjust wave start card position and width ([2c661c6](https://github.com/remarkablegames/battlemon/commit/2c661c6d958d67f4096e291a5978f20157f37dad))
* change heal moves from percentage to fixed HP, balance air heal to 10 and team mend to 5 ([1cd5335](https://github.com/remarkablegames/battlemon/commit/1cd53351c9aceb57118498e919288191b9fb3809))
* enforce minimum text size of 20 across all scenes and HUD ([993eb7c](https://github.com/remarkablegames/battlemon/commit/993eb7c8bb5dbc82de42a48aadb9676ea226511e))
* only use heal special when team member below 50% HP to prevent endless battles ([14f3bed](https://github.com/remarkablegames/battlemon/commit/14f3bed0a5e222f1f2b9bf228718ad9dc1d612a0))
* **postBattle:** fix xp bar animation for level up ([d1baf20](https://github.com/remarkablegames/battlemon/commit/d1baf20fa942a4904fbb18414c959c2883e6c36d))
* render selection border as stroked outline above card to prevent hover clipping ([5a0676c](https://github.com/remarkablegames/battlemon/commit/5a0676cf538b4c20697c1d1cadc93efe72f4f71f))
* **scenes:** prevent starter scene text and title from being clipped ([2f1f21b](https://github.com/remarkablegames/battlemon/commit/2f1f21ba253a9a24633de56dd0ebac10b65ea8ce))
* **shop:** add delay for level up modal and revert monster sell close ([581bc59](https://github.com/remarkablegames/battlemon/commit/581bc59ca78bdd95ba8711941e488dbb6ceb8da5))
* **shop:** don't apply full heal but add it to items when purchased ([ba51c6b](https://github.com/remarkablegames/battlemon/commit/ba51c6bc5a016ccb697745be2168c4866e33daa4))
* toggle selection border via outline width instead of opacity, use green outline in tame scene ([0521808](https://github.com/remarkablegames/battlemon/commit/05218088809458ed0fc256b1b6372e9b0dedc8e1))
* **utils:** guard against type error in monster ([ab8cf53](https://github.com/remarkablegames/battlemon/commit/ab8cf5341028361867ee458d6bf483d07ec7f6e6))
