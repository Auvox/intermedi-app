import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import { useTheme } from '@/context/theme-context';

export function CategoryPersonIcon({ label }: { label: string }) {
  const { colors } = useTheme();
  const name = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const fever = /febre|antipiret/.test(name);
  const headache = /cabeca|enxaqueca/.test(name);
  const cough = /gripe|resfri|tosse|respirat/.test(name);
  const stomach = /digest|estomac|estomag|gastr|intestin/.test(name);
  const heart = /card|pressao|hipertens/.test(name);
  const allergy = /alerg|histamin|pele|dermat/.test(name);
  const pain = /dor|analges|inflam/.test(name);
  const headZoom = fever || headache || cough;
  const torsoZoom = !headZoom && (stomach || heart);
  const red = '#E34D59';
  const green = colors.primaryDark;
  if (/antibiot|antimicrob|antibacter/.test(name)) return <Svg width={84} height={92} viewBox="0 0 100 110" accessible={false}>
    <G fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <G transform="rotate(-35 43 43)">
        <Rect x="28" y="12" width="30" height="62" rx="15" />
        <Path d="M28 43H58" />
        <Path d="M36 24Q36 20 40 20" />
      </G>
    </G>
    <G fill="none" stroke={red} strokeWidth="2.3" strokeLinecap="round">
      <Rect x="53" y="66" width="27" height="16" rx="8" transform="rotate(-25 66.5 74)" fill={red} fillOpacity={0.12} />
      <Path d="M53 68L49 65M61 63L60 58M71 62L73 57M80 67L85 65M82 77L87 79M74 84L76 89M63 85L62 90M54 80L50 83" />
      <Circle cx="62" cy="75" r="1" /><Circle cx="71" cy="71" r="1" />
    </G>
  </Svg>;
  if (/vitamin|suplement/.test(name)) return <Svg width={84} height={92} viewBox="0 0 100 110" accessible={false}>
    <G fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="34" y="14" width="32" height="13" rx="3" />
      <Path d="M37 27V33L28 42V88Q28 95 35 95H65Q72 95 72 88V42L63 33V27" />
      <Path d="M41 18V23M50 18V23M59 18V23" />
      <Rect x="28" y="49" width="44" height="30" rx="2" />
    </G>
    <Path d="M42 57L50 71L58 57" stroke={red} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
  if (/diabet|glicem|glicose/.test(name)) return <Svg width={84} height={92} viewBox="0 0 100 110" accessible={false}>
    <G fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="22" y="16" width="49" height="68" rx="10" />
      <Rect x="30" y="27" width="33" height="24" rx="3" />
      <Circle cx="46.5" cy="66" r="6" />
      <Path d="M39 84V101H54V84M43 89V97M50 89V97" />
      <Path d="M36 39H42L46 33L50 44L54 39H58" strokeWidth="1.8" />
    </G>
    <Path d="M78 49C76 54 71 59 71 64C71 73 85 73 85 64C85 59 80 54 78 49Z" fill={red} fillOpacity={0.14} stroke={red} strokeWidth="2.3" strokeLinejoin="round" />
  </Svg>;
  return <Svg width={84} height={92} viewBox={headZoom ? '23 1 54 55' : torsoZoom ? '19 25 62 66' : '0 0 100 132'} accessible={false}>
    <G fill="none" stroke={green} strokeWidth={headZoom ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M40 30V34L28 38Q25 39 23 45L13 73Q11 78 15 79Q19 81 21 76L30 54L32 72L29 120Q29 126 34 126Q39 126 40 121L47 83H53L60 121Q61 126 66 126Q71 126 71 120L68 72L70 54L79 76Q81 81 85 79Q89 78 87 73L77 45Q75 39 72 38L60 34V30" />
      <Path d="M50 5C40 5 36 12 37 21C38 30 44 34 50 34C56 34 62 30 63 21C64 12 60 5 50 5Z" />
      <Path d="M33 70Q50 75 67 70M43 37Q50 40 57 37" opacity={0.45} />
      {headZoom && <Path d="M43 20H46M54 20H57M50 21L48 25H51M46 29H54" strokeWidth={1.1} />}
    </G>
    {(fever || headache) && <>
      <Ellipse cx="50" cy="13" rx="10" ry="5" fill={red} opacity={0.16} />
      <Path d="M41 14Q50 9 59 14" stroke={red} strokeWidth="2.3" fill="none" strokeLinecap="round" />
      {fever && <G stroke={red} strokeWidth="1.4" fill="none" strokeLinecap="round"><Path d="M67 9Q64 12 67 15Q70 18 67 21M72 7Q69 10 72 13Q75 16 72 19" /></G>}
      {headache && <G stroke={red} strokeWidth="1.5" strokeLinecap="round"><Path d="M31 12L28 10M30 18H26M69 12L72 10" /></G>}
    </>}
    {cough && !fever && !headache && <>
      <Ellipse cx="50" cy="31" rx="6" ry="7" fill={red} opacity={0.16} />
      <Path d="M46 28H54M47 34Q50 37 53 34" stroke={red} strokeWidth="2" fill="none" strokeLinecap="round" />
      <G stroke={red} strokeWidth="1.5" strokeLinecap="round"><Path d="M66 26L70 24M67 30H73M65 34L69 37" /></G>
    </>}
    {stomach && !headZoom && <>
      <Ellipse cx="50" cy="61" rx="12" ry="9" fill={red} opacity={0.12} />
      <Path d="M49 50V56Q57 50 60 57Q63 66 54 69Q45 71 43 64Q42 61 46 60" stroke={red} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>}
    {heart && !headZoom && <>
      <Circle cx="56" cy="48" r="10" fill={red} opacity={0.12} />
      <Path d="M56 45C50 38 44 48 56 55C68 48 62 38 56 45Z" stroke={red} strokeWidth="1.8" fill="none" />
    </>}
    {allergy && !headZoom && !torsoZoom && <G fill={red}><Circle cx="39" cy="50" r="2" /><Circle cx="42" cy="56" r="2" /><Circle cx="37" cy="59" r="1.7" /><Circle cx="73" cy="61" r="2" /><Circle cx="75" cy="67" r="1.7" /></G>}
    {pain && !headZoom && !torsoZoom && !allergy && <G fill="none" stroke={red} strokeWidth="2"><Circle cx="31" cy="51" r="6" fill={red} fillOpacity={0.12} /><Circle cx="65" cy="97" r="6" fill={red} fillOpacity={0.12} /></G>}
  </Svg>;
}
