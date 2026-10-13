var e={id:`time`,h:{en:`Time ranges and the simulated clock`,hi:`Time ranges aur simulated clock`},body:{en:`
<p>Some access should exist only at certain times: a vendor may update the web server only on Saturday night, or the canteen kiosk network may be open only during office hours. A rule can carry a <b>time</b> option that names a <b>time range</b> element. Outside the range the rule is simply not active.</p>

<h3>Analogy: the shop shutter</h3>
<p>A shop has a sign: "Open Monday to Saturday, 9 to 6". The shop is still there at 10 pm; the shutter is down. A rule with a time range is the shop: still in the list, but inactive when the shutter is down. A visitor at 10 pm does not "break" the shop, the shop is just closed.</p>

<h3>How a time-range rule behaves</h3>
<ul>
<li>A time range element holds <b>days</b> and a <b>from</b> and <b>to</b> time, for example Saturday 22:00 to 23:59.</li>
<li>A rule with that time range matches only while the clock is inside it, plus the usual source, destination and service tests.</li>
<li>Outside the range the rule is skipped and evaluation continues downward. This is the same "skipped, not denying" idea as authentication.</li>
</ul>
<p>In a real engine the time comes from the engine's clock, so correct time and time zone settings matter. In the simulator, a <b>simulated clock</b> (a day and a time) drives time rules. The tool lets you move the clock so you can test inside and outside the range without waiting.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Time range and clock">
<line x1="40" y1="90" x2="600" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="400" y="60" width="140" height="60" rx="6" fill="#bbf7d0"/><text x="470" y="95" text-anchor="middle" class="svg-ink" font-size="12">Sat 22:00 to 23:59</text>
<text x="40" y="140" class="svg-muted" font-size="12">Fri 12:00</text><text x="190" y="140" class="svg-muted" font-size="12">Sat 09:00</text><text x="400" y="140" class="svg-muted" font-size="12">Sat 22:00</text><text x="545" y="140" class="svg-muted" font-size="12">Sun 00:00</text>
<circle cx="190" cy="90" r="6" fill="#fed7aa" stroke="#64748b"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">clock here: rule skipped</text>
<circle cx="470" cy="90" r="6" fill="#bae6fd" stroke="#64748b"/><text x="470" y="45" text-anchor="middle" class="svg-accent" font-size="12">clock here: rule active</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">The rule exists all week; it matches only inside the green window</text>
</svg><p class="cap">Only the position of the clock decides whether a time-range rule can match.</p></div>

<h3>Why a rule is "never active"</h3>
<p>When someone says "this rule never works", time is a common cause. Check these in order:</p>
<ol>
<li><b>The range is empty or impossible.</b> From later than To on the same day, or no days selected, means no moment matches.</li>
<li><b>The wrong days.</b> The range says Monday to Friday but the test runs on a Saturday.</li>
<li><b>The clock is not what you think.</b> The simulated clock shows a different day or hour than your wall clock. In a real engine, a wrong time zone causes the same effect.</li>
<li><b>The range is missing.</b> If the named range does not exist, install is blocked by a validation error (chapter nine).</li>
<li><b>Something above already decided.</b> Time is not the reason, but the symptom looks the same.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Time range <code>sat-night</code>: Saturday 22:00 to 23:59. Rule 6 allows <code>net-staff</code> to <code>srv-web</code> on SSH with that range. A vendor engineer tests at Saturday 21:30 and is dropped by the Discard below the rule. At Saturday 22:10 the same test succeeds with rule 6. At Sunday 00:05 it is dropped again. The rule did not change; only the clock did.</p></div>
<pre class="out">Simulated clock: Sat 21:30
Policy match test  10.1.1.10 -&gt; 172.16.20.20 tcp/22
 6    no   (time: sat-night, outside range)
<span class="hl"> 7    MATCH   any -&gt; any   any   Discard</span>

Simulated clock: Sat 22:10
 6    MATCH   net-staff -&gt; srv-web   SSH   Allow   time sat-night</pre>

<div class="warn"><p><b>Common mistake.</b> Assuming a time-range rule is "deny outside the hours". It is not. Outside the range it is skipped and lower rules decide, so if a broad Allow sits below, traffic may be allowed anyway. If you want a block outside the window, write that block as its own rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> Time is evaluated against the engine clock, not your laptop. Also remember that a rule outside its time range is not a Discard; it is skipped. In the labs the clock is simulated and can be moved.</p></div>

<div class="scn"><h4>The maintenance window that never opened</h4><p>A vendor was told SSH would be open on Saturday night. At 22:30 they reported timeouts. The rule and range existed. The admin checked the range and found From 22:00 and To 02:00, entered as a single-day range, so To was earlier than From and no time ever matched. The admin split the window into two ranges (Saturday 22:00 to 23:59 and Sunday 00:00 to 02:00), installed, and the vendor connected.</p><p><b>Lesson:</b> a rule that is never active is often a range that can never be true. Test with the clock inside and outside the window.</p></div>
<div class="iv"><p class="q">"A time-based rule does not seem to work. How do you troubleshoot it?"</p><p>Verify the range definition (days, from, to), the engine time and time zone, that the policy with the rule was installed, and that no earlier rule matches first. Test both inside and outside the window with the Policy match test.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A time range limits when a rule can match; outside it, the rule is skipped.</li>
<li>Skipped is not denied; lower rules decide.</li>
<li>Check days, from/to, and the clock when a rule is never active.</li>
<li>The simulator has a movable clock for testing both sides of the window.</li>
</ul></div>
`,hi:`
<p>Kuch access sirf kuch samay ke liye hona chahiye: vendor web server sirf Saturday raat ko update kare, ya canteen kiosk network sirf office hours mein khula rahe. Rule mein <b>time</b> option ho sakta hai jo ek <b>time range</b> element ka naam leta hai. Range ke bahar rule bas active nahi hota.</p>

<h3>Analogy: dukaan ka shutter</h3>
<p>Dukaan par sign hai: "Monday se Saturday, 9 se 6 khula". Raat 10 baje bhi dukaan wahi hai; bas shutter neeche hai. Time range wala rule woh dukaan hai: list mein rehta hai par shutter neeche ho to inactive. Raat 10 baje aaya visitor dukaan ko "tod" nahi raha, dukaan bas band hai.</p>

<h3>Time-range rule ka behaviour</h3>
<ul>
<li>Time range element mein <b>days</b> aur <b>from</b> aur <b>to</b> time hota hai, jaise Saturday 22:00 se 23:59.</li>
<li>Us time range wala rule tabhi match karta hai jab clock range ke andar ho, aur usual source, destination, service tests bhi pass hon.</li>
<li>Range ke bahar rule skip hota hai aur evaluation neeche chalti hai. Yeh authentication jaisa hi "skipped, denying nahi" idea hai.</li>
</ul>
<p>Real engine mein time engine ki clock se aata hai, isliye sahi time aur time zone settings zaroori hain. Simulator mein ek <b>simulated clock</b> (din aur samay) time rules chalati hai. Tool aapko clock aage-peeche karne deta hai, taaki range ke andar aur bahar bina intezaar kiye test kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Time range aur clock">
<line x1="40" y1="90" x2="600" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="400" y="60" width="140" height="60" rx="6" fill="#bbf7d0"/><text x="470" y="95" text-anchor="middle" class="svg-ink" font-size="12">Sat 22:00 to 23:59</text>
<text x="40" y="140" class="svg-muted" font-size="12">Fri 12:00</text><text x="190" y="140" class="svg-muted" font-size="12">Sat 09:00</text><text x="400" y="140" class="svg-muted" font-size="12">Sat 22:00</text><text x="545" y="140" class="svg-muted" font-size="12">Sun 00:00</text>
<circle cx="190" cy="90" r="6" fill="#fed7aa" stroke="#64748b"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">clock yahan: rule skip</text>
<circle cx="470" cy="90" r="6" fill="#bae6fd" stroke="#64748b"/><text x="470" y="45" text-anchor="middle" class="svg-accent" font-size="12">clock yahan: rule active</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Rule poore hafte list mein hai; sirf green window mein match karta hai</text>
</svg><p class="cap">Time-range rule match kar sakta hai ya nahi, yeh sirf clock ki position tay karti hai.</p></div>

<h3>Rule "kabhi active kyun nahi"</h3>
<p>Jab koi kehta hai "yeh rule kabhi kaam nahi karta", to time aam wajah hai. Is order mein check karo:</p>
<ol>
<li><b>Range empty ya impossible hai.</b> Usi din From, To se baad ka ho, ya koi din select na ho, to koi pal match nahi karta.</li>
<li><b>Galat days.</b> Range Monday se Friday hai par test Saturday ko chal raha hai.</li>
<li><b>Clock woh nahi jo aap sochte ho.</b> Simulated clock aapki wall clock se alag din ya ghanta dikhati hai. Real engine mein galat time zone se yahi hota hai.</li>
<li><b>Range missing hai.</b> Named range exist nahi karta to install validation error se block hota hai (chapter nine).</li>
<li><b>Upar kisi ne pehle hi decide kar diya.</b> Wajah time nahi hai, par symptom wahi dikhta hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Time range <code>sat-night</code>: Saturday 22:00 se 23:59. Rule 6 us range ke saath <code>net-staff</code> ko <code>srv-web</code> par SSH allow karta hai. Vendor engineer Saturday 21:30 par test karta hai aur rule ke neeche ke Discard se drop hota hai. Saturday 22:10 par wahi test rule 6 se succeed hota hai. Sunday 00:05 par phir drop. Rule nahi badla; sirf clock badli.</p></div>
<pre class="out">Simulated clock: Sat 21:30
Policy match test  10.1.1.10 -&gt; 172.16.20.20 tcp/22
 6    no   (time: sat-night, outside range)
<span class="hl"> 7    MATCH   any -&gt; any   any   Discard</span>

Simulated clock: Sat 22:10
 6    MATCH   net-staff -&gt; srv-web   SSH   Allow   time sat-night</pre>

<div class="warn"><p><b>Common mistake.</b> Maan lena ki time-range rule "ghanton ke bahar deny" karta hai. Aisa nahi hai. Range ke bahar woh skip hota hai aur neeche ke rules decide karte hain, to neeche broad Allow ho to traffic phir bhi allow ho sakta hai. Window ke bahar block chahiye to woh block alag rule likho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Time engine clock se evaluate hota hai, aapke laptop se nahi. Yaad rakho ki time range ke bahar rule Discard nahi hota; skip hota hai. Labs mein clock simulated hai aur move ki ja sakti hai.</p></div>

<div class="scn"><h4>Maintenance window jo kabhi khula hi nahi</h4><p>Vendor ko bola gaya tha ki Saturday raat SSH khula rahega. Raat 22:30 par unhone timeouts report kiye. Rule aur range maujood the. Admin ne range check ki aur From 22:00 aur To 02:00 mila, single-day range ki tarah, to To, From se pehle tha aur koi samay match nahi karta tha. Admin ne window ko do ranges mein baanta (Saturday 22:00 se 23:59 aur Sunday 00:00 se 02:00), install kiya, aur vendor connect ho gaya.</p><p><b>Lesson:</b> jo rule kabhi active nahi hota woh aksar aisi range hoti hai jo kabhi true ho hi nahi sakti. Clock ko window ke andar aur bahar rakh kar test karo.</p></div>
<div class="iv"><p class="q">"Time-based rule kaam nahi kar raha. Troubleshoot kaise karoge?"</p><p>Range definition (days, from, to), engine time aur time zone, rule wali policy install hui ya nahi, aur koi pehle ka rule pehle match to nahi karta, yeh verify karo. Policy match test se window ke andar aur bahar dono test karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Time range tay karta hai rule kab match kar sakta hai; bahar rule skip hota hai.</li>
<li>Skipped matlab denied nahi; neeche ke rules decide karte hain.</li>
<li>Rule kabhi active na ho to days, from/to aur clock check karo.</li>
<li>Simulator mein movable clock hai, window ke dono taraf test karne ke liye.</li>
</ul></div>
`}};export{e as default};