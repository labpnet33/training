var e={id:`rrm`,h:{en:`RRM: DCA, TPC, coverage hole detection, RF groups and the wl-design-rrm-model lab`,hi:`RRM: DCA, TPC, coverage hole detection, RF groups aur wl-design-rrm-model lab`},body:{en:`
<p><b>Radio Resource Management (RRM)</b> is the controller's automatic RF engineer: it watches the air and adjusts channels and power so your plan keeps working when neighbours, noise or clients change. <code>wl-rf</code> introduced DCA and TPC; here you see how they decide, what an RF group is, how coverage holes are detected, and when to constrain RRM. The real algorithms are <b>concept only</b>; the lab uses simplified teaching versions.</p>

<h3>Analogy: a traffic police control room</h3>
<p>Cameras see jams (interference), and the control room re-routes cars (channel changes) and changes signal timings (power). One control room handles one city (the RF group). If two cities do not share data, each manages its own traffic and cannot see the other's jam at the border.</p>

<h3>The RF group</h3>
<p>APs send <b>neighbour discovery</b> frames on a regular schedule. APs that hear each other at about -80 dBm or better, and that belong to controllers with the <b>same RF group name</b>, form an <b>RF group</b>. One controller is elected <b>group leader</b>; it collects the radio measurements of every AP in the group and runs DCA and TPC for all of them, so neighbouring APs on different controllers still get one plan. There is a group per band.</p>
<p>The RF group name is set with <code>wireless rf-network</code>. The group mode per band is <b>auto</b> (elect a leader), <b>leader</b> (force this controller to lead) or <b>off</b> (no grouping; this controller plans alone).</p>
<div class="exam"><p><b>Exam trap.</b> An <b>RF group</b> is for radio planning (RRM); a <b>mobility group</b> is for client roaming and tunnelling. They are separate names and separate features. Controllers can be in the same RF group and different mobility groups.</p></div>

<h3>DCA: Dynamic Channel Assignment</h3>
<p>DCA picks the channel and width for each radio from the allowed list. It scores each candidate with a <b>cost metric</b> that combines interference from other APs, non-Wi-Fi noise and the load on the channel. It runs at an <b>interval</b> (10 minutes by default), and a <b>sensitivity</b> setting decides how much better the new plan must be before it is applied, which prevents constant churn. You control: the channel list (for example, remove reserved channels or DFS), the channel width, and the sensitivity. DCA can be limited per RF profile, which is how chapter 4's PLAN-5 narrows the list. A manually set channel is never changed by DCA.</p>

<h3>TPC: Transmit Power Control</h3>
<p>TPC lowers power where APs are dense. In TPC version 1, each AP looks at the <b>third loudest neighbour</b> it hears; if that neighbour is stronger than the target (the default threshold is -70 dBm) the AP reduces power until the third neighbour would sit near the threshold. Min and max power bound the result. The lab uses this idea exactly: power comes from the third-loudest neighbour with a -70 dBm target, bounded by the min and max.</p>
<div class="eg"><p><b>Worked example.</b> An AP hears its third loudest neighbour at -62 dBm. The target is -70 dBm, so the neighbour is 8 dB too loud. Power moves in 3 dB steps, so the AP can reduce by two whole steps (6 dB): level 2 (17 dBm) becomes level 4 (11 dBm). A third step (9 dB) would overshoot the 8 dB need. If the profile maximum was already 8 dBm the AP stays at 8 dBm, and if TPC min is 11 dBm it cannot go below 11 dBm.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="RRM decisions">
<rect x="10" y="20" width="190" height="130" rx="8" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">DCA (channel)</text>
<text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">cost: interference,</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="12">noise, load</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="12">interval + sensitivity</text><text x="105" y="132" text-anchor="middle" class="svg-muted" font-size="12">channel list + width</text>
<rect x="225" y="20" width="190" height="130" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">TPC (power)</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">3rd loudest neighbour</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">target -70 dBm</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">min and max bounds</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">3 dB steps</text>
<rect x="440" y="20" width="190" height="130" rx="8" fill="#fde68a"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">CHDM (hole)</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">clients below -80 dBm</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="12">3 clients and 25%</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">raise power one step</text><text x="535" y="132" text-anchor="middle" class="svg-muted" font-size="12">if the cap allows</text>
</svg><p class="cap">Three RRM functions. The group leader runs them for the whole RF group.</p></div>

<h3>CHDM: Coverage Hole Detection and Mitigation</h3>
<p>CHDM watches client signal. An AP raises a <b>coverage hole</b> when enough clients stay below the RSSI threshold: by default <b>-80 dBm for data and -80 dBm for voice</b>, at least <b>3 clients</b>, and at least <b>25 percent</b> of that AP's clients. Mitigation raises the AP's power by one step. It cannot go above the profile or RRM maximum, which is the trap in the lab <code>wl-design-coverage-hole</code>: a cap of 8 dBm blocks mitigation. The lab prints these thresholds in <code>show ap dot11 5ghz coverage</code> as data and voice RSSI, coverage exception percent and coverage level (clients).</p>

<h3>Event-driven RRM and Flexible Radio Assignment</h3>
<p><b>Event-driven RRM (EDRRM)</b> reacts at once when CleanAir reports a serious interferer (chapter 10) instead of waiting for the DCA interval. <b>FRA</b> lets dual-band APs with a flexible radio change a 2.4 GHz radio into a second 5 GHz radio when 2.4 GHz is redundant. Both are concept only here.</p>

<h3>The lab: RRM model</h3>
<p>Five APs are dense enough that RRM must turn power down. Configure TPC bounds, an RF group and a DCA restart, then read the results.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rrm txpower auto
WLC1(config)# ap dot11 5ghz rrm txpower min 8
WLC1(config)# ap dot11 5ghz rrm txpower max 17
WLC1(config)# wireless rf-network NK-CAMPUS
WLC1(config)# ap dot11 5ghz rrm group-mode leader
WLC1(config)# end
WLC1# ap dot11 5ghz rrm dca restart</pre>
<p>GUI: <b>Configuration &gt; Radio Configurations &gt; RRM &gt; 5 GHz Band</b>, tabs General (group mode), DCA, TPC, and <b>Configuration &gt; Wireless &gt; Global</b> for the RF group name. In this simulator the same settings are on <b>Configuration &gt; Wireless &gt; RRM</b>. Exact command syntax varies by release; these are the model forms. Verify:</p>
<pre class="out">WLC1# show ap dot11 5ghz group

Radio RF Grouping
  RF Network Name  : NK-CAMPUS
  5 GHz Group Mode : LEADER
  5 GHz Group Leader : WLC1 (this controller)
  5 GHz Group Members : WLC1 (1 controller in this model)

WLC1# show ap name AP5 auto-rf dot11 5ghz

AP Name                          : AP5
Radio Type                       : 802.11a (5 GHz)
Channel                          : 149
Channel Width                    : 20 MHz
Tx Power Level                   : <span class="hl">4 (11 dBm)</span>
Nearby APs                       : 2
  AP AP2 : -72 dBm on channel 40, 11.4 m
  AP AP3 : -72 dBm on channel 44, 11.4 m</pre>
<p>The prompt shows power level 4 (11 dBm) for the middle AP, which sits close to two neighbours. Check <code>show ap dot11 5ghz summary</code>: every radio must be between power level 2 (17 dBm) and level 5 (8 dBm) with no overlap. (Neighbour values are examples.)</p>

<h3>When to constrain RRM</h3>
<ul>
<li><b>Voice and high density:</b> set min and max power in the RF profile so TPC cannot make cells too small or too big.</li>
<li><b>Special areas</b> (warehouse bridges, stadiums): limit the DCA channel list or set channels manually.</li>
<li><b>Maintenance windows:</b> freeze or restart DCA at quiet times; do not let a channel change hit a call.</li>
<li><b>Never turn RRM off</b> because of one bad AP: fix the cause (power cap, bad channel list, interferer).</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Different RF group names on controllers that should plan together; leaving RRM at defaults in a stadium; a tx-power max in the profile that is lower than the coverage needs; confusing RF group with mobility group; expecting RRM to fix a design with too few APs.</p></div>

<div class="scn"><h4>Two controllers, one floor, two plans</h4><p>Floor 3 was served by two controllers named differently in the RF network field. Each ran its own DCA, so APs on the controller border picked the same channel and heard each other at -60 dBm. After the team set one RF group name on both, a single leader planned the whole floor and the border APs changed to different channels.</p><p><b>Lesson:</b> same RF group name for the controllers whose APs can hear each other.</p></div>

<div class="iv"><p class="q">"How does TPC decide the transmit power, and what does coverage hole detection do?"</p><p>TPC checks the third loudest neighbour against a -70 dBm threshold and lowers power until it fits, within min and max bounds. CHDM raises power by one step when at least 3 clients and 25 percent of an AP's clients stay below -80 dBm, if the maximum allows. The group leader runs both for the whole RF group.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF group = same RF group name plus APs hearing each other at about -80 dBm; the leader runs DCA and TPC.</li>
<li>RF group is for RRM; mobility group is for roaming. Do not mix them.</li>
<li>DCA scores interference, noise and load at an interval with a sensitivity; manual channels are never changed.</li>
<li>TPC: third loudest neighbour, -70 dBm target, 3 dB steps, bounded by min and max.</li>
<li>CHDM: -80 dBm, 3 clients, 25 percent; mitigation is one power step and needs headroom.</li>
</ul></div>
`,hi:`
<p><b>Radio Resource Management (RRM)</b> controller ka automatic RF engineer hai: yeh hawa ko dekhta hai aur channels aur power adjust karta hai taaki padosi, noise ya clients badlein tab bhi aapka plan chalta rahe. <code>wl-rf</code> ne DCA aur TPC introduce kiye the; yahan aap dekhte ho ki woh kaise decide karte hain, RF group kya hai, coverage holes kaise detect hote hain, aur RRM ko kab constrain karna chahiye. Real algorithms <b>concept only</b> hain; lab simplified teaching versions use karta hai.</p>

<h3>Analogy: traffic police control room</h3>
<p>Cameras jam (interference) dekhte hain, aur control room cars ko re-route karta hai (channel changes) aur signal timings (power) badalta hai. Ek control room ek shehar (RF group) sambhalta hai. Agar do shehar data share nahi karte, to har ek apna traffic sambhalta hai aur border par doosre ka jam nahi dekh paata.</p>

<h3>RF group</h3>
<p>APs ek regular schedule par <b>neighbour discovery</b> frames bhejte hain. Jo APs ek dusre ko lagbhag -80 dBm ya behtar par sunte hain, aur jo <b>same RF group name</b> wale controllers ke hain, woh ek <b>RF group</b> banate hain. Ek controller <b>group leader</b> elect hota hai; woh group ke har AP ke radio measurements collect karta hai aur sab ke liye DCA aur TPC chalata hai, isliye alag controllers par bhi padosi APs ko ek hi plan milta hai. Har band ke liye ek group hota hai.</p>
<p>RF group name <code>wireless rf-network</code> se set hota hai. Per band group mode <b>auto</b> (leader elect karo), <b>leader</b> (is controller ko leader banao) ya <b>off</b> (grouping nahi; yeh controller akela plan karta hai) hai.</p>
<div class="exam"><p><b>Exam trap.</b> <b>RF group</b> radio planning (RRM) ke liye hai; <b>mobility group</b> client roaming aur tunnelling ke liye hai. Yeh alag naam aur alag features hain. Controllers same RF group aur alag mobility groups mein ho sakte hain.</p></div>

<h3>DCA: Dynamic Channel Assignment</h3>
<p>DCA allowed list se har radio ke liye channel aur width chunta hai. Woh har candidate ko <b>cost metric</b> se score karta hai jo doosre APs ka interference, non-Wi-Fi noise aur channel ka load milata hai. Woh ek <b>interval</b> par chalta hai (default 10 minute), aur <b>sensitivity</b> setting decide karti hai ki naya plan apply hone se pehle kitna behtar hona chahiye, jisse lagatar churn rukta hai. Aap control karte ho: channel list (jaise reserved channels ya DFS hatao), channel width, aur sensitivity. DCA ko per RF profile limit kiya ja sakta hai, aise hi chapter 4 ka PLAN-5 list ko narrow karta hai. Manually set channel ko DCA kabhi nahi badalta.</p>

<h3>TPC: Transmit Power Control</h3>
<p>TPC jahan APs dense hon wahan power kam karta hai. TPC version 1 mein har AP jo <b>teesra sabse loud neighbour</b> sunta hai use dekhta hai; agar woh neighbour target (default threshold -70 dBm) se zyada strong hai to AP power tab tak kam karta hai jab tak teesra neighbour threshold ke paas na baithe. Min aur max power result ko bound karte hain. Lab yahi idea use karta hai: power teesre sabse loud neighbour se aati hai, -70 dBm target ke saath, min aur max se bounded.</p>
<div class="eg"><p><b>Worked example.</b> Ek AP apne teesre sabse loud neighbour ko -62 dBm par sunta hai. Target -70 dBm hai, isliye neighbour 8 dB zyada loud hai. Power 3 dB steps mein chalti hai, isliye AP do poore steps (6 dB) kam kar sakta hai: level 2 (17 dBm) level 4 (11 dBm) ban jaata hai. Teesra step (9 dB) 8 dB ki zaroorat se aage nikal jaata. Agar profile maximum pehle se 8 dBm tha to AP 8 dBm par rehta hai, aur agar TPC min 11 dBm hai to woh 11 dBm se neeche nahi ja sakta.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="RRM ke decisions">
<rect x="10" y="20" width="190" height="130" rx="8" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">DCA (channel)</text>
<text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">cost: interference,</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="12">noise, load</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="12">interval + sensitivity</text><text x="105" y="132" text-anchor="middle" class="svg-muted" font-size="12">channel list + width</text>
<rect x="225" y="20" width="190" height="130" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">TPC (power)</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">3rd loudest neighbour</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">target -70 dBm</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">min aur max bounds</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">3 dB steps</text>
<rect x="440" y="20" width="190" height="130" rx="8" fill="#fde68a"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">CHDM (hole)</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">-80 dBm se neeche clients</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="12">3 clients aur 25%</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">power ek step badhao</text><text x="535" y="132" text-anchor="middle" class="svg-muted" font-size="12">agar cap allow kare</text>
</svg><p class="cap">Teen RRM functions. Group leader poore RF group ke liye inhe chalata hai.</p></div>

<h3>CHDM: Coverage Hole Detection and Mitigation</h3>
<p>CHDM client signal dekhta hai. AP tab <b>coverage hole</b> raise karta hai jab kaafi clients RSSI threshold se neeche rehte hain: default <b>data ke liye -80 dBm aur voice ke liye -80 dBm</b>, kam se kam <b>3 clients</b>, aur us AP ke clients ka kam se kam <b>25 percent</b>. Mitigation AP ki power ek step badhata hai. Woh profile ya RRM maximum se upar nahi ja sakta, jo lab <code>wl-design-coverage-hole</code> ka trap hai: 8 dBm ka cap mitigation rok deta hai. Lab <code>show ap dot11 5ghz coverage</code> mein yeh thresholds data aur voice RSSI, coverage exception percent aur coverage level (clients) ke roop mein print karta hai.</p>

<h3>Event-driven RRM aur Flexible Radio Assignment</h3>
<p><b>Event-driven RRM (EDRRM)</b> jab CleanAir koi serious interferer report karta hai (chapter 10) to DCA interval ka intezaar kiye bina turant react karta hai. <b>FRA</b> flexible radio wale dual-band APs ko 2.4 GHz radio ko doosre 5 GHz radio mein badalne deta hai jab 2.4 GHz redundant ho. Dono yahan concept only hain.</p>

<h3>Lab: RRM model</h3>
<p>Paanch AP itne dense hain ki RRM ko power kam karni hi hogi. TPC bounds, RF group aur DCA restart configure karo, phir results padho.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rrm txpower auto
WLC1(config)# ap dot11 5ghz rrm txpower min 8
WLC1(config)# ap dot11 5ghz rrm txpower max 17
WLC1(config)# wireless rf-network NK-CAMPUS
WLC1(config)# ap dot11 5ghz rrm group-mode leader
WLC1(config)# end
WLC1# ap dot11 5ghz rrm dca restart</pre>
<p>GUI: <b>Configuration &gt; Radio Configurations &gt; RRM &gt; 5 GHz Band</b>, tabs General (group mode), DCA, TPC, aur RF group name ke liye <b>Configuration &gt; Wireless &gt; Global</b>. Is simulator mein wahi settings <b>Configuration &gt; Wireless &gt; RRM</b> par hain. Exact command syntax release ke hisaab se badalta hai; yeh model forms hain. Verify:</p>
<pre class="out">WLC1# show ap dot11 5ghz group

Radio RF Grouping
  RF Network Name  : NK-CAMPUS
  5 GHz Group Mode : LEADER
  5 GHz Group Leader : WLC1 (this controller)
  5 GHz Group Members : WLC1 (1 controller in this model)

WLC1# show ap name AP5 auto-rf dot11 5ghz

AP Name                          : AP5
Radio Type                       : 802.11a (5 GHz)
Channel                          : 149
Channel Width                    : 20 MHz
Tx Power Level                   : <span class="hl">4 (11 dBm)</span>
Nearby APs                       : 2
  AP AP2 : -72 dBm on channel 40, 11.4 m
  AP AP3 : -72 dBm on channel 44, 11.4 m</pre>
<p>Beech wala AP, jo do padosiyon ke kareeb baitha hai, power level 4 (11 dBm) dikhata hai. <code>show ap dot11 5ghz summary</code> check karo: har radio power level 2 (17 dBm) aur level 5 (8 dBm) ke beech aur overlap ke bina hona chahiye. (Neighbour values examples hain.)</p>

<h3>RRM ko kab constrain karna hai</h3>
<ul>
<li><b>Voice aur high density:</b> RF profile mein min aur max power set karo taaki TPC cells ko bahut chhota ya bahut bada na kar sake.</li>
<li><b>Special areas</b> (warehouse bridges, stadiums): DCA channel list limit karo ya channels manually set karo.</li>
<li><b>Maintenance windows:</b> DCA ko shaant time par freeze ya restart karo; channel change ko call par mat girne do.</li>
<li><b>RRM kabhi off mat karo</b> ek kharab AP ki wajah se: wajah fix karo (power cap, kharab channel list, interferer).</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Jo controllers saath plan karne chahiye unpar alag RF group names; stadium mein RRM ko defaults par chhodna; profile mein tx-power max jo coverage ki zaroorat se kam ho; RF group ko mobility group se confuse karna; RRM se expect karna ki kam APs wala design theek kar de.</p></div>

<div class="scn"><h4>Do controllers, ek floor, do plans</h4><p>Floor 3 ko do controllers serve karte the jinke RF network field mein alag naam the. Har ek apna DCA chalata tha, isliye controller border ke APs ne same channel chuna aur ek dusre ko -60 dBm par sunte rahe. Team ne dono par ek RF group name set kiya to ek leader ne poore floor ko plan kiya aur border APs alag channels par chale gaye.</p><p><b>Seekh:</b> jin controllers ke APs ek dusre ko sun sakte hain unka RF group name same rakho.</p></div>

<div class="iv"><p class="q">"TPC transmit power kaise decide karta hai, aur coverage hole detection kya karta hai?"</p><p>TPC teesre sabse loud neighbour ko -70 dBm threshold se compare karta hai aur min aur max bounds ke andar power tab tak kam karta hai jab tak fit na ho. CHDM ek step power badhata hai jab AP ke kam se kam 3 clients aur 25 percent clients -80 dBm se neeche rehte hain, agar maximum allow kare. Group leader dono poore RF group ke liye chalata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF group = same RF group name plus lagbhag -80 dBm par ek dusre ko sunte APs; leader DCA aur TPC chalata hai.</li>
<li>RF group RRM ke liye hai; mobility group roaming ke liye. Mix mat karo.</li>
<li>DCA interference, noise aur load ko interval aur sensitivity ke saath score karta hai; manual channels kabhi nahi badalte.</li>
<li>TPC: teesra sabse loud neighbour, -70 dBm target, 3 dB steps, min aur max se bounded.</li>
<li>CHDM: -80 dBm, 3 clients, 25 percent; mitigation ek power step hai aur headroom chahiye.</li>
</ul></div>
`}};export{e as default};