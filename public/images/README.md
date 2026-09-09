# Login Page Background Image

Ang file na `campus-bg.jpg` dito ay ang background image ng login page.

## Paano palitan ang background

1. I-drop ang gusto mong larawan (ideal: **1920x1080px o mas malaki**, JPG/PNG format)
2. Pangalanan itong `campus-bg.jpg` (o baguhin ang pangalan kung gusto mo)
3. I-replace ang file na ito sa `public/images/` folder

Kung bibigyan mo ng ibang pangalan ang file (hal. `my-campus.jpg`),
i-update mo rin ang path sa:
- `src/components/LoginPage.jsx` (line 55) — palitan ang `url('/images/campus-bg.jpg')`

## Kontrol sa dark overlay

Ang dark overlay (dark translucent layer sa itaas ng image) ay nasa
`src/components/LoginPage.jsx` (line 55):

- Mas madilim: dagdagan ang `0.82` at `0.9` (hal. `0.9` at `0.95`)
- Mas maliwanag (kita ang image): bawasan ang mga ito (hal. `0.5` at `0.6`)