# Third-party notices

Patina's code and documentation are MIT-licensed (see `LICENSE`); the fonts are not. The repository contains or is derived from the material below, which keeps its
own licence. Keep these notices when you copy Patina's files into a project.

## shadcn/ui (MIT)

The registry components in `registry/ui/` are written for Base UI and Patina's tokens, and follow the structure and
naming of the shadcn/ui components they replace (`button`, `card`, `chart`, `dropdown-menu`, and so on). The token set
started from the shadcn/ui preset `b3JSmtB71E` (Luma, Mist, Emerald, Base UI), and the registry item format is
shadcn's. shadcn/ui is distributed under this licence:

```
MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Phosphor Icons (MIT)

The icons in the component previews (`design-system/components/`), the vector paths in the generated Android
`Icons.kt` and the SVGs that the Slint gallery loads are Phosphor Icons, regular weight.

```
MIT License

Copyright (c) 2020-2024 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Fonts (SIL Open Font License 1.1)

`fonts/` holds the official D2Coding and MaruBuri files, and the build serves them at `/fonts/*` with their licence
texts. Inter, JetBrains Mono, Newsreader and Pretendard come from npm packages. All of them are licensed under the
SIL OFL 1.1 and are **not** covered by Patina's MIT licence. The licence texts are in
`design-system/assets/Licenses/`:

| Font | Licence text |
|---|---|
| Inter | `Inter-OFL.txt` |
| JetBrains Mono | `JetBrainsMono-OFL.txt` |
| Newsreader | `Newsreader-OFL.txt` |
| Pretendard | `Pretendard-OFL.txt` |
| D2Coding | `D2Coding-OFL.txt` |
| MaruBuri | `MaruBuri-OFL.txt` |

Pretendard, D2Coding and MaruBuri have Reserved Font Names: use the official files as they are. Subsetting or converting
them makes a modified version, which must be renamed. Ship the licence text with every font you distribute.

## Used by the projects that adopt Patina (not part of this repository)

Patina's files depend on, but do not contain, these projects. You get them from their own packages under their own
licences: Base UI (MIT), Tailwind CSS (MIT), recharts (MIT), class-variance-authority (Apache-2.0),
Compose Material 3 (Apache-2.0) and the Slint runtime (GPL-3.0, royalty-free or commercial licence: choose the one
that fits your application).
