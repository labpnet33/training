var e={id:`rrm-dca-tpc`,h:{en:`Radio Resource Management: DCA, TPC and coverage hole detection`,hi:`Radio Resource Management: DCA, TPC aur coverage hole detection`},body:{en:`
<p>A large site has hundreds of APs and the radio environment changes all day: neighbours switch on, doors close, crowds arrive. Nobody can retune every AP by hand. <b>Radio Resource Management (RRM)</b> is the controller's automatic loop that measures the air and adjusts channels and power. This chapter explains the real algorithms at concept level, what they cannot do, and how the lab differs.</p>
<div class="note"><p><b>Not simulated in the lab.</b> The lab controller does not run real RRM. DCA, TPC, CHD, RF groups and Flexible Radio Assignment are explained here as concepts. In the lab, AP channels are assigned deterministically (an AP gets a fixed channel from a rotation, such as 1, 6, 11 in 2.4 GHz) and you override them by hand.</p></div>

<h3>The RRM idea in one picture</h3>
<p>Every AP spends a little time off-channel (about 50 milliseconds every 180 seconds by default in real products) listening to other channels, and its neighbours. It reports what it hears (other APs' power, noise, interference, utilisation) to the controller. The controller then runs three jobs:</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="RRM loop">
<rect x="20" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">APs scan</text><text x="75" y="113" text-anchor="middle" class="svg-muted" font-size="11">neighbours, noise</text>
<rect x="175" y="70" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="230" y="95" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="230" y="113" text-anchor="middle" class="svg-muted" font-size="11">RRM algorithms</text>
<rect x="340" y="10" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="405" y="37" text-anchor="middle" class="svg-ink" font-size="13">DCA: channels</text>
<rect x="340" y="78" width="130" height="44" rx="8" fill="#fde68a"/><text x="405" y="105" text-anchor="middle" class="svg-ink" font-size="13">TPC: power</text>
<rect x="340" y="146" width="130" height="44" rx="8" fill="#fed7aa"/><text x="405" y="173" text-anchor="middle" class="svg-ink" font-size="13">CHD: holes</text>
<rect x="520" y="70" width="100" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="105" text-anchor="middle" class="svg-ink" font-size="13">AP radios</text>
<line x1="130" y1="100" x2="175" y2="100" stroke="#64748b"/><line x1="285" y1="100" x2="340" y2="32" stroke="#64748b"/><line x1="285" y1="100" x2="340" y2="100" stroke="#64748b"/><line x1="285" y1="100" x2="340" y2="168" stroke="#64748b"/>
<line x1="470" y1="32" x2="520" y2="90" stroke="#64748b"/><line x1="470" y1="100" x2="520" y2="100" stroke="#64748b"/><line x1="470" y1="168" x2="520" y2="112" stroke="#64748b"/>
</svg><p class="cap">Measure, decide, apply, repeat. The loop runs continuously.</p></div>

<h3>Dynamic Channel Assignment (DCA)</h3>
<p>DCA chooses the channel for each radio to minimise interference and balance load. It scores candidate channels using the interference from other APs (inside and outside your network), the noise floor, the load, and the cost of changing. It changes a channel only if a better one exists by a <b>sensitivity</b> margin, which you can set to low, medium or high (high reacts to small gains and changes channels more often). You can also give DCA a channel list (for example skip DFS channels, or use only 1, 6, 11 in 2.4 GHz) and a channel width. DCA runs at an <b>interval</b> and an <b>anchor time</b>. The default interval is 10 minutes and the anchor time is an hour of the day (0 to 23); many networks lengthen the interval so channels change only in quiet hours. CleanAir, event-driven RRM and the design side of RRM come in wl-design (Wireless design).</p>

<h3>Transmit Power Control (TPC)</h3>
<p>TPC adjusts power so that each AP hears its third strongest neighbour at about a threshold (for example -70 dBm in a real default). If an AP can hear three neighbours louder than that, it lowers power; if it hears fewer, it raises power up to the maximum. TPC thus keeps cells overlapping just enough for roaming. In a real RF profile you can set a minimum and maximum TPC power so the algorithm stays in a sensible range. The lab's <code>tx-power max 14</code> corresponds to that <i>maximum</i> limit.</p>

<h3>Coverage Hole Detection (CHD)</h3>
<p>If enough clients, at a minimum signal level and for a minimum time, are connected with a low signal (for example below -80 dBm) and cannot roam to a better AP, the controller marks a possible coverage hole and can raise that AP's power. CHD is a reactive safety net, not a substitute for a survey: it fixes small gaps, not a missing AP.</p>

<h3>RF groups and the leader</h3>
<p>APs that hear each other, even across different controllers, can form an <b>RF group</b> with a group leader that calculates DCA and TPC for all members. This way two controllers with neighbouring APs do not fight. The group is identified by an RF group name, so all controllers in one site share one name.</p>

<table class="cmp"><tr><th>Function</th><th>Controls</th><th>Typical trigger</th><th>Risk if mis-tuned</th></tr>
<tr><td>DCA</td><td>Channel and width</td><td>Interference, noise, load</td><td>Channel flapping, client drops</td></tr>
<tr><td>TPC</td><td>Transmit power</td><td>Neighbour RSSI threshold</td><td>Cells too big or holes</td></tr>
<tr><td>CHD</td><td>Raises power for holes</td><td>Many weak clients</td><td>Masks missing coverage</td></tr>
<tr><td>Static override</td><td>Fixed channel or level</td><td>Human decision</td><td>RRM cannot adapt (as in the lab)</td></tr>
</table>

<h3>When to leave RRM alone, and when to pin</h3>
<p>Default practice: leave DCA and TPC enabled, set sensible limits in an RF profile, and watch. Pin a channel or power only for special cases: a point-to-point bridge, a high-density hall where you hand-tune after a survey, a test, or a known radar problem. Every pin must be documented and reviewed because a forgotten pin is how the lab's co-channel fault was born.</p>
<p>RF design also uses <b>RF profiles</b> to feed RRM with per-area policy: a lecture hall profile may allow only low power and high data rates; a warehouse profile may allow high power and low rates. The next chapter builds this on the controller.</p>

<div class="warn"><p><b>Common mistakes.</b> Setting DCA sensitivity to high in a stable office (channel changes during meetings); letting RRM run with a channel list that includes DFS channels in a radar-prone site; assuming TPC will fix a bad design (it only adjusts power within what the AP count allows); mixing RF group names across controllers that serve the same floor.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember who does what: DCA is channels, TPC is power, CHD raises power only for holes. TPC lowers power when many neighbours are loud. Do not say DCA changes power.</p></div>

<div class="scn"><h4>Channels that changed during the board meeting</h4><p>A bank's boardroom lost Wi-Fi twice during meetings. The log showed DCA moving the room's AP from channel 36 to 52 (a DFS channel) after radar was detected, and back later. The team created a boardroom RF profile that excluded DFS channels and set a fixed 5 GHz channel plan for that floor.</p><p><b>Lesson:</b> understand what RRM is doing before blaming the AP, and use profiles to constrain it.</p></div>

<div class="iv"><p class="q">"What is RRM and would you ever disable it?"</p><p>RRM is the controller's automatic management of channels (DCA), power (TPC) and coverage holes (CHD), based on AP scans. Keep it on by default and constrain it with RF profiles. Disable it per radio only for fixed links, special rooms or controlled tests, and document the pin.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RRM = scan, decide, apply: DCA channels, TPC power, CHD holes.</li>
<li>TPC keeps neighbours near a threshold; the RF profile max and min bound it.</li>
<li>RF groups let multiple controllers agree on one plan.</li>
<li>In the lab RRM is not simulated: channels are deterministic and pinned by hand.</li>
<li>Every manual pin should be documented and reviewed.</li>
</ul></div>
`,hi:`
<p>Bade site par hundreds of APs hote hain aur radio environment poora din badalta rehta hai: padosi switch on karte hain, darwaze band hote hain, bheed aati hai. Koi bhi har AP ko haath se retune nahi kar sakta. <b>Radio Resource Management (RRM)</b> controller ka automatic loop hai jo hawa ko measure karke channels aur power adjust karta hai. Yeh chapter real algorithms ko concept level par samjhata hai, woh kya nahi kar sakte, aur lab kaise alag hai.</p>
<div class="note"><p><b>Lab mein simulate nahi hota.</b> Lab controller real RRM nahi chalata. DCA, TPC, CHD, RF groups aur Flexible Radio Assignment yahan concepts ke roop mein samjhaye gaye hain. Lab mein AP channels deterministic tareeke se assign hote hain (AP ko rotation se fixed channel milta hai, jaise 2.4 GHz mein 1, 6, 11) aur aap unhe haath se override karte ho.</p></div>

<h3>RRM ka idea ek picture mein</h3>
<p>Har AP thoda time off-channel bitata hai (real products mein by default har 180 second mein lagbhag 50 millisecond) doosre channels aur apne neighbours ko sunne ke liye. Woh jo sunta hai (doosre APs ki power, noise, interference, utilisation) controller ko report karta hai. Phir controller teen kaam chalata hai:</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="RRM loop">
<rect x="20" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">APs scan</text><text x="75" y="113" text-anchor="middle" class="svg-muted" font-size="11">neighbours, noise</text>
<rect x="175" y="70" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="230" y="95" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="230" y="113" text-anchor="middle" class="svg-muted" font-size="11">RRM algorithms</text>
<rect x="340" y="10" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="405" y="37" text-anchor="middle" class="svg-ink" font-size="13">DCA: channels</text>
<rect x="340" y="78" width="130" height="44" rx="8" fill="#fde68a"/><text x="405" y="105" text-anchor="middle" class="svg-ink" font-size="13">TPC: power</text>
<rect x="340" y="146" width="130" height="44" rx="8" fill="#fed7aa"/><text x="405" y="173" text-anchor="middle" class="svg-ink" font-size="13">CHD: holes</text>
<rect x="520" y="70" width="100" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="105" text-anchor="middle" class="svg-ink" font-size="13">AP radios</text>
<line x1="130" y1="100" x2="175" y2="100" stroke="#64748b"/><line x1="285" y1="100" x2="340" y2="32" stroke="#64748b"/><line x1="285" y1="100" x2="340" y2="100" stroke="#64748b"/><line x1="285" y1="100" x2="340" y2="168" stroke="#64748b"/>
<line x1="470" y1="32" x2="520" y2="90" stroke="#64748b"/><line x1="470" y1="100" x2="520" y2="100" stroke="#64748b"/><line x1="470" y1="168" x2="520" y2="112" stroke="#64748b"/>
</svg><p class="cap">Measure, decide, apply, repeat. Loop continuously chalta hai.</p></div>

<h3>Dynamic Channel Assignment (DCA)</h3>
<p>DCA har radio ke liye channel chunta hai taaki interference kam ho aur load balance ho. Woh candidate channels ko score karta hai: doosre APs ka interference (aapke network ke andar aur bahar), noise floor, load, aur change karne ki cost. Woh channel tabhi badalta hai jab ek <b>sensitivity</b> margin se behtar channel mile, jo aap low, medium ya high set kar sakte ho (high chhote gains par bhi react karta hai aur channels zyada badalta hai). Aap DCA ko channel list bhi de sakte ho (jaise DFS channels skip karo, ya 2.4 GHz mein sirf 1, 6, 11) aur channel width bhi. DCA ek <b>interval</b> aur ek <b>anchor time</b> par chalta hai. Default interval 10 minute hai aur anchor time din ka ek ghanta (0 se 23) hai; kai networks interval lamba karte hain taaki channels sirf quiet hours mein badlein. CleanAir, event-driven RRM aur RRM ka design side wl-design (Wireless design) mein aata hai.</p>

<h3>Transmit Power Control (TPC)</h3>
<p>TPC power adjust karta hai taaki har AP apne teesre sabse strong neighbour ko lagbhag ek threshold par sune (jaise real default mein -70 dBm). Agar AP us se zyada loud teen neighbours sun sakta hai to power kam karta hai; agar kam sunta hai to maximum tak power badhata hai. Isse TPC cells ko roaming ke liye bas utna overlap rakhta hai. Real RF profile mein aap minimum aur maximum TPC power set kar sakte ho taaki algorithm sensible range mein rahe. Lab ka <code>tx-power max 14</code> usi <i>maximum</i> limit ke barabar hai.</p>

<h3>Coverage Hole Detection (CHD)</h3>
<p>Agar kaafi clients, minimum signal level par aur minimum time tak, low signal (jaise -80 dBm se neeche) ke saath connected hain aur behtar AP par roam nahi kar sakte, to controller possible coverage hole mark karta hai aur us AP ki power badha sakta hai. CHD ek reactive safety net hai, survey ka substitute nahi: yeh chhote gaps theek karta hai, missing AP nahi.</p>

<h3>RF groups aur leader</h3>
<p>Jo APs ek dusre ko sunte hain, chahe alag controllers par hon, ek <b>RF group</b> bana sakte hain jiska group leader sabhi members ke liye DCA aur TPC calculate karta hai. Is tarah neighbouring APs wale do controllers ek dusre se ladte nahi. Group ki pehchaan RF group name se hoti hai, isliye ek site ke saare controllers ek name share karte hain.</p>

<table class="cmp"><tr><th>Function</th><th>Kya control karta hai</th><th>Typical trigger</th><th>Galat tune ho to risk</th></tr>
<tr><td>DCA</td><td>Channel aur width</td><td>Interference, noise, load</td><td>Channel flapping, client drops</td></tr>
<tr><td>TPC</td><td>Transmit power</td><td>Neighbour RSSI threshold</td><td>Cells bahut badi ya holes</td></tr>
<tr><td>CHD</td><td>Holes ke liye power badhata hai</td><td>Bahut weak clients</td><td>Missing coverage chhupa deta hai</td></tr>
<tr><td>Static override</td><td>Fixed channel ya level</td><td>Insaani decision</td><td>RRM adapt nahi kar sakta (lab jaisa)</td></tr>
</table>

<h3>RRM ko kab chhodna hai, kab pin karna hai</h3>
<p>Default practice: DCA aur TPC enabled rakho, RF profile mein sensible limits set karo, aur dekhte raho. Channel ya power sirf special cases mein pin karo: point-to-point bridge, high-density hall jahan survey ke baad haath se tune karte ho, test, ya known radar problem. Har pin documented aur reviewed hona chahiye kyunki bhoola hua pin hi wahi tareeka hai jisse lab ka co-channel fault paida hua.</p>
<p>RF design <b>RF profiles</b> ko bhi use karta hai taaki RRM ko per-area policy mile: lecture hall profile sirf low power aur high data rates allow kar sakta hai; warehouse profile high power aur low rates. Agla chapter ise controller par banata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Stable office mein DCA sensitivity high set karna (meetings ke dauran channel changes); radar-prone site mein DFS channels wali channel list ke saath RRM chalana; yeh maan lena ki TPC kharab design theek kar dega (woh sirf APs ki sankhya jitna allow kare utna power adjust karta hai); ek hi floor serve karne wale controllers par alag RF group names mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho kaun kya karta hai: DCA channels hai, TPC power hai, CHD sirf holes ke liye power badhata hai. TPC tab power kam karta hai jab kai neighbours loud hon. Yeh mat kaho ki DCA power badalta hai.</p></div>

<div class="scn"><h4>Board meeting mein badle channels</h4><p>Ek bank ke boardroom mein meetings ke dauran do baar Wi-Fi gaya. Log mein dikha ki radar detect hone ke baad DCA ne room ke AP ko channel 36 se 52 (DFS channel) par move kiya, aur baad mein wapas. Team ne boardroom RF profile banaya jisme DFS channels exclude the aur us floor ke liye fixed 5 GHz channel plan set kiya.</p><p><b>Seekh:</b> AP ko blame karne se pehle samjho ki RRM kya kar raha hai, aur profiles se use constrain karo.</p></div>

<div class="iv"><p class="q">"RRM kya hai aur kya aap kabhi ise disable karoge?"</p><p>RRM controller ka AP scans par based channels (DCA), power (TPC) aur coverage holes (CHD) ka automatic management hai. Ise default par on rakho aur RF profiles se constrain karo. Per radio sirf fixed links, special rooms ya controlled tests ke liye disable karo, aur pin document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RRM = scan, decide, apply: DCA channels, TPC power, CHD holes.</li>
<li>TPC neighbours ko threshold ke paas rakhta hai; RF profile ka max aur min use bound karte hain.</li>
<li>RF groups multiple controllers ko ek plan par agree karne dete hain.</li>
<li>Lab mein RRM simulate nahi hota: channels deterministic hain aur haath se pin hote hain.</li>
<li>Har manual pin documented aur reviewed hona chahiye.</li>
</ul></div>
`}};export{e as default};