var e={id:`method-1-3`,h:{en:`The methodology, part 1: identify, theorise, test`,hi:`Methodology, part 1: identify, theory, test`},body:{en:`
<p>Objective 5.1 asks you to explain the CompTIA troubleshooting methodology. It has seven steps, and the exam expects them <b>in order, with their sub-steps</b>. This chapter covers the first three steps, the thinking half. The next chapter covers the doing half. To make it real, we follow one ticket through all seven steps.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="The seven steps">
<rect x="4" y="30" width="84" height="50" rx="8" fill="#fde68a"/><text x="46" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Identify</text><text x="46" y="68" text-anchor="middle" class="svg-muted" font-size="12">problem</text>
<rect x="95" y="30" width="84" height="50" rx="8" fill="#fde68a"/><text x="137" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Theory</text><text x="137" y="68" text-anchor="middle" class="svg-muted" font-size="12">probable cause</text>
<rect x="186" y="30" width="84" height="50" rx="8" fill="#fde68a"/><text x="228" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Test</text><text x="228" y="68" text-anchor="middle" class="svg-muted" font-size="12">the theory</text>
<rect x="277" y="30" width="84" height="50" rx="8" fill="#bae6fd"/><text x="319" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Plan</text><text x="319" y="68" text-anchor="middle" class="svg-muted" font-size="12">and effects</text>
<rect x="368" y="30" width="84" height="50" rx="8" fill="#bae6fd"/><text x="410" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Implement</text><text x="410" y="68" text-anchor="middle" class="svg-muted" font-size="12">or escalate</text>
<rect x="459" y="30" width="84" height="50" rx="8" fill="#bbf7d0"/><text x="501" y="52" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="501" y="68" text-anchor="middle" class="svg-muted" font-size="12">and prevent</text>
<rect x="550" y="30" width="84" height="50" rx="8" fill="#ddd6fe"/><text x="592" y="52" text-anchor="middle" class="svg-ink" font-size="12">7 Document</text><text x="592" y="68" text-anchor="middle" class="svg-muted" font-size="12">lessons</text>
<path d="M228 82 Q 180 110 137 82" fill="none" stroke="#64748b"/><text x="182" y="112" text-anchor="middle" class="svg-muted" font-size="12">not confirmed</text>
</svg><p class="cap">Steps 1 to 3 are the thinking half. If a test fails, you loop back to a new theory (or escalate).</p></div>

<div class="eg"><p><b>The running ticket.</b> INC-4410, priority P2: "Since about 09:15 the accounts team on floor 3 cannot open the payroll web app payroll.corp.example (10.20.30.40)." Floor 3 users are in VLAN 30, subnet 10.3.30.0/24, and their gateway is the core switch SVI 10.3.30.1.</p></div>

<h3>Step 1: Identify the problem</h3>
<p>This step turns a complaint into facts. CompTIA lists these sub-steps:</p>
<ul>
<li><b>Gather information.</b> Read the ticket, the monitoring dashboard and recent logs.</li>
<li><b>Question users.</b> Who is affected, since when, what exactly happens, what error do they see? Ask open questions, then closed ones.</li>
<li><b>Identify symptoms.</b> Timeout, error message, slowness, one app or all apps.</li>
<li><b>Determine if anything has changed.</b> Check the change log. Most outages follow a change.</li>
<li><b>Duplicate the problem, if possible.</b> Reproduce it yourself so you can later prove the fix.</li>
<li><b>Approach multiple problems individually.</b> If users report three issues, open three tickets and work them one at a time.</li>
</ul>
<div class="eg"><p><b>Step 1 on INC-4410.</b> You call two users. Both see a browser timeout, not an error page. Email and the internet work. Floor 2 staff open payroll without trouble. The change calendar shows CHG-2291 at 08:40: "add PCI filter to VLAN 30 on CORE1". You reproduce from a floor-3 PC:</p>
<pre class="out">C:&#92;&gt; ping 10.20.30.40
Reply from 10.20.30.40: bytes=32 time=1ms TTL=63
Reply from 10.20.30.40: bytes=32 time=1ms TTL=63

PS C:&#92;&gt; Test-NetConnection 10.20.30.40 -Port 443
<span class="hl">TcpTestSucceeded : False</span></pre>
<p>One user also says the floor printer is slow. That is a separate problem, so you open INC-4411 for it and keep going.</p></div>

<h3>Step 2: Establish a theory of probable cause</h3>
<p>A theory is a guess you can test. Sub-steps:</p>
<ul>
<li><b>Question the obvious.</b> Is it plugged in, powered on, the right VLAN, the right address? Obvious causes are the most common causes.</li>
<li><b>Consider multiple approaches:</b>
<ul>
<li><b>Top-to-bottom OSI:</b> start at layer 7 (does the app answer?) and work down. Good when the app is the complaint and lower layers look healthy.</li>
<li><b>Bottom-to-top OSI:</b> start at layer 1 (link lights, cable) and work up. Good when nothing works at all.</li>
<li><b>Divide and conquer:</b> start in the middle, usually with a layer 3 ping. If it works, layers 1 to 3 are fine and you go up; if not, you go down. The fastest approach for most tickets.</li>
</ul></li>
</ul>
<p>Other useful techniques you will hear about: <b>follow the path</b> (hop by hop from source to destination), <b>compare with a working device</b> (floor 2 works, floor 3 does not: what differs?) and <b>swap components</b> (move the user to a known-good port or cable).</p>
<div class="eg"><p><b>Step 2 on INC-4410.</b> Ping works, so layers 1 to 3 are fine end to end (divide and conquer answered that in one command). TCP 443 fails from floor 3 but works from floor 2. The only difference is the source subnet, and a filter was added for VLAN 30 at 08:40. <b>Theory:</b> the new ACL on CORE1 interface Vlan30 blocks TCP 443 to the payroll server.</p></div>

<h3>Step 3: Test the theory to determine the cause</h3>
<p>Now prove it without changing anything. Two outcomes:</p>
<ul>
<li><b>Theory confirmed:</b> determine the next steps to resolve the problem (go to step 4).</li>
<li><b>Theory not confirmed:</b> establish a new theory, or <b>escalate</b> to someone with more knowledge or access.</li>
</ul>
<div class="eg"><p><b>Step 3 on INC-4410.</b> You read the ACL and watch its hit counters while a user retries:</p>
<pre class="out">CORE1# show ip interface vlan 30 | include access list
  Outgoing access list is not set
  <span class="hl">Inbound  access list is FLOOR3-IN</span>
CORE1# show access-lists FLOOR3-IN
Extended IP access list FLOOR3-IN
    10 deny tcp 10.3.30.0 0.0.0.255 host 10.20.40.25 eq 1433 (12 matches)
    <span class="hl">20 deny tcp any host 10.20.30.40 eq 443 (318 matches)</span>
    30 permit ip any any (90211 matches)</pre>
<p>Line 20 is matching, and its counter climbs on every retry. Theory confirmed. The change author meant to block only the guest range, but wrote <code>any</code>.</p></div>

<div class="tip"><p><b>Tip.</b> Hit counters are a gift. <code>show access-lists</code> tells you exactly which line is catching the traffic. You can also run <code>clear access-list counters FLOOR3-IN</code> and retry, so the only new matches are your test.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jumping from step 1 straight to a fix ("I bet it is DNS, let me change it"). Testing a theory by changing production config. Keeping a theory after the evidence disproves it. Forgetting that escalation is a valid outcome of step 3, not a failure.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Determine if anything has changed" and "duplicate the problem" belong to step 1, not step 2. "Question the obvious" and the OSI approaches belong to step 2. If a question says "the theory was not confirmed", the answer is "establish a new theory or escalate", never "implement the solution".</p></div>

<div class="scn"><h4>The Monday morning that was really a Sunday change</h4><p>On a Monday, a branch could not reach any cloud apps. The on-call engineer spent an hour checking the ISP circuit, which was perfect. A colleague opened the change calendar and found that the firewall team had pushed a new outbound policy on Sunday night. A single rule order issue was dropping HTTPS. With the change found, the fix took five minutes.</p><p><b>Lesson:</b> "Determine if anything has changed" is the cheapest, fastest sub-step. Do it in the first five minutes of every ticket.</p></div>

<div class="iv"><p class="q">"What is divide and conquer, and why do engineers like it?"</p><p>Explain that you start in the middle of the OSI model, usually with a ping by IP. If it succeeds, layers 1 to 3 are proven along the whole path and you move up to transport and application. If it fails, you move down. One test removes half the possibilities. Compare it with top-down (start at the app) and bottom-up (start at the cable) and say when you would pick each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Step 1 Identify: gather info, question users, identify symptoms, find changes, duplicate the problem, one problem at a time.</li>
<li>Step 2 Theory: question the obvious; use top-down, bottom-up or divide and conquer.</li>
<li>Step 3 Test: confirmed means plan the fix; not confirmed means a new theory or escalate.</li>
<li>Test without changing production: read counters, logs and tables.</li>
<li>A recent change is the most common root cause; always check the change log.</li>
</ul></div>
`,hi:`
<p>Objective 5.1 aapse CompTIA troubleshooting methodology samjhane ko kehta hai. Iske saat steps hain, aur exam unhe <b>order mein, unke sub-steps ke saath</b> expect karta hai. Yeh chapter pehle teen steps cover karta hai, yaani sochne wala half. Agla chapter karne wala half cover karta hai. Ise real banane ke liye hum ek ticket ko saaton steps mein follow karenge.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Saat steps">
<rect x="4" y="30" width="84" height="50" rx="8" fill="#fde68a"/><text x="46" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Identify</text><text x="46" y="68" text-anchor="middle" class="svg-muted" font-size="12">problem</text>
<rect x="95" y="30" width="84" height="50" rx="8" fill="#fde68a"/><text x="137" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Theory</text><text x="137" y="68" text-anchor="middle" class="svg-muted" font-size="12">probable cause</text>
<rect x="186" y="30" width="84" height="50" rx="8" fill="#fde68a"/><text x="228" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Test</text><text x="228" y="68" text-anchor="middle" class="svg-muted" font-size="12">theory ka</text>
<rect x="277" y="30" width="84" height="50" rx="8" fill="#bae6fd"/><text x="319" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Plan</text><text x="319" y="68" text-anchor="middle" class="svg-muted" font-size="12">aur effects</text>
<rect x="368" y="30" width="84" height="50" rx="8" fill="#bae6fd"/><text x="410" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Implement</text><text x="410" y="68" text-anchor="middle" class="svg-muted" font-size="12">ya escalate</text>
<rect x="459" y="30" width="84" height="50" rx="8" fill="#bbf7d0"/><text x="501" y="52" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="501" y="68" text-anchor="middle" class="svg-muted" font-size="12">aur prevent</text>
<rect x="550" y="30" width="84" height="50" rx="8" fill="#ddd6fe"/><text x="592" y="52" text-anchor="middle" class="svg-ink" font-size="12">7 Document</text><text x="592" y="68" text-anchor="middle" class="svg-muted" font-size="12">lessons</text>
<path d="M228 82 Q 180 110 137 82" fill="none" stroke="#64748b"/><text x="182" y="112" text-anchor="middle" class="svg-muted" font-size="12">confirm nahi hua</text>
</svg><p class="cap">Steps 1 se 3 sochne wala half hain. Agar test fail ho, to nayi theory par wapas jao (ya escalate karo).</p></div>

<div class="eg"><p><b>Running ticket.</b> INC-4410, priority P2: "Lagbhag 09:15 se floor 3 ki accounts team payroll web app payroll.corp.example (10.20.30.40) nahi khol pa rahi." Floor 3 ke users VLAN 30 mein hain, subnet 10.3.30.0/24, aur unka gateway core switch ka SVI 10.3.30.1 hai.</p></div>

<h3>Step 1: Problem identify karo</h3>
<p>Yeh step shikayat ko facts mein badalta hai. CompTIA yeh sub-steps list karta hai:</p>
<ul>
<li><b>Information jutao.</b> Ticket, monitoring dashboard aur haal ke logs padho.</li>
<li><b>Users se sawaal karo.</b> Kaun affected hai, kab se, exactly kya hota hai, kaunsa error dikhta hai? Pehle open sawaal, phir closed.</li>
<li><b>Symptoms identify karo.</b> Timeout, error message, slowness, ek app ya saare apps.</li>
<li><b>Dekho kuch badla hai kya.</b> Change log check karo. Zyada tar outages kisi change ke baad aate hain.</li>
<li><b>Ho sake to problem duplicate karo.</b> Khud reproduce karo taaki baad mein fix saabit kar sako.</li>
<li><b>Multiple problems ko alag alag approach karo.</b> Agar users teen issues report karein, to teen tickets kholo aur ek ek karke kaam karo.</li>
</ul>
<div class="eg"><p><b>INC-4410 par step 1.</b> Aap do users ko call karte ho. Dono ko browser timeout dikhta hai, error page nahi. Email aur internet chalte hain. Floor 2 ka staff payroll bina dikkat kholta hai. Change calendar 08:40 par CHG-2291 dikhata hai: "CORE1 par VLAN 30 mein PCI filter add karo". Aap floor-3 ke PC se reproduce karte ho:</p>
<pre class="out">C:&#92;&gt; ping 10.20.30.40
Reply from 10.20.30.40: bytes=32 time=1ms TTL=63
Reply from 10.20.30.40: bytes=32 time=1ms TTL=63

PS C:&#92;&gt; Test-NetConnection 10.20.30.40 -Port 443
<span class="hl">TcpTestSucceeded : False</span></pre>
<p>Ek user yeh bhi kehta hai ki floor printer slow hai. Yeh alag problem hai, isliye aap uske liye INC-4411 kholte ho aur aage badhte ho.</p></div>

<h3>Step 2: Probable cause ki theory banao</h3>
<p>Theory ek andaaza hai jise aap test kar sakte ho. Sub-steps:</p>
<ul>
<li><b>Obvious par sawaal karo.</b> Plug laga hai, power on hai, sahi VLAN hai, sahi address hai? Obvious causes hi sabse common causes hain.</li>
<li><b>Kai approaches socho:</b>
<ul>
<li><b>Top-to-bottom OSI:</b> layer 7 se shuru karo (app jawab deti hai?) aur neeche jao. Tab achha jab shikayat app ki ho aur neeche ki layers healthy dikhein.</li>
<li><b>Bottom-to-top OSI:</b> layer 1 se shuru karo (link lights, cable) aur upar jao. Tab achha jab kuch bhi kaam na kare.</li>
<li><b>Divide and conquer:</b> beech se shuru karo, aam taur par layer 3 ping se. Chal gayi to layers 1 se 3 theek hain aur aap upar jaate ho; nahi chali to neeche. Zyada tar tickets ke liye sabse tez approach.</li>
</ul></li>
</ul>
<p>Kuch aur useful techniques jo aap sunoge: <b>follow the path</b> (source se destination tak hop by hop), <b>working device se compare karo</b> (floor 2 chalta hai, floor 3 nahi: farak kya hai?) aur <b>components swap karo</b> (user ko known-good port ya cable par le jao).</p>
<div class="eg"><p><b>INC-4410 par step 2.</b> Ping chalti hai, isliye layers 1 se 3 end to end theek hain (divide and conquer ne ek command mein yeh jawab de diya). TCP 443 floor 3 se fail hota hai lekin floor 2 se chalta hai. Farak sirf source subnet ka hai, aur 08:40 par VLAN 30 ke liye ek filter add hua tha. <b>Theory:</b> CORE1 interface Vlan30 par naya ACL payroll server tak TCP 443 block kar raha hai.</p></div>

<h3>Step 3: Cause pata karne ke liye theory test karo</h3>
<p>Ab kuch bhi badle bina ise saabit karo. Do outcomes:</p>
<ul>
<li><b>Theory confirm hui:</b> problem solve karne ke agle steps decide karo (step 4 par jao).</li>
<li><b>Theory confirm nahi hui:</b> nayi theory banao, ya zyada knowledge ya access wale ko <b>escalate</b> karo.</li>
</ul>
<div class="eg"><p><b>INC-4410 par step 3.</b> Aap ACL padhte ho aur user ke retry karte waqt uske hit counters dekhte ho:</p>
<pre class="out">CORE1# show ip interface vlan 30 | include access list
  Outgoing access list is not set
  <span class="hl">Inbound  access list is FLOOR3-IN</span>
CORE1# show access-lists FLOOR3-IN
Extended IP access list FLOOR3-IN
    10 deny tcp 10.3.30.0 0.0.0.255 host 10.20.40.25 eq 1433 (12 matches)
    <span class="hl">20 deny tcp any host 10.20.30.40 eq 443 (318 matches)</span>
    30 permit ip any any (90211 matches)</pre>
<p>Line 20 match ho rahi hai, aur har retry par uska counter badhta hai. Theory confirm. Change likhne wale ka iraada sirf guest range block karna tha, lekin usne <code>any</code> likh diya.</p></div>

<div class="tip"><p><b>Tip.</b> Hit counters ek tohfa hain. <code>show access-lists</code> exactly batata hai kaunsi line traffic pakad rahi hai. Aap <code>clear access-list counters FLOOR3-IN</code> chala kar retry bhi kar sakte ho, taaki naye matches sirf aapke test ke hon.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Step 1 se seedha fix par koodna ("pakka DNS hai, badal deta hoon"). Production config badal kar theory test karna. Evidence ke galat saabit karne ke baad bhi theory pakde rehna. Yeh bhoolna ki escalation step 3 ka valid outcome hai, failure nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Determine if anything has changed" aur "duplicate the problem" step 1 ke hain, step 2 ke nahi. "Question the obvious" aur OSI approaches step 2 ke hain. Agar sawaal kahe "theory confirm nahi hui", to jawab hai "nayi theory banao ya escalate karo", kabhi "solution implement karo" nahi.</p></div>

<div class="scn"><h4>Monday subah jo asal mein Sunday ka change tha</h4><p>Ek Monday ko ek branch koi bhi cloud app tak nahi pahunch pa rahi thi. On-call engineer ne ek ghanta ISP circuit check karne mein lagaya, jo bilkul theek tha. Ek colleague ne change calendar khola aur paaya ki firewall team ne Sunday raat naya outbound policy push kiya tha. Ek rule order issue HTTPS drop kar raha tha. Change milne ke baad fix mein paanch minute lage.</p><p><b>Seekh:</b> "Determine if anything has changed" sabse sasta, sabse tez sub-step hai. Har ticket ke pehle paanch minute mein karo.</p></div>

<div class="iv"><p class="q">"Divide and conquer kya hai, aur engineers ise kyun pasand karte hain?"</p><p>Samjhao ki aap OSI model ke beech se shuru karte ho, aam taur par IP se ping karke. Agar successful, to poore path par layers 1 se 3 saabit ho gayi aur aap transport aur application par upar jaate ho. Fail ho to neeche jaate ho. Ek test aadhi possibilities hata deta hai. Ise top-down (app se shuru) aur bottom-up (cable se shuru) se compare karo aur batao kab kaunsa chunoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Step 1 Identify: info jutao, users se poochho, symptoms pehchano, changes dhoondo, problem duplicate karo, ek time par ek problem.</li>
<li>Step 2 Theory: obvious par sawaal karo; top-down, bottom-up ya divide and conquer use karo.</li>
<li>Step 3 Test: confirm matlab fix plan karo; confirm nahi matlab nayi theory ya escalate.</li>
<li>Production badle bina test karo: counters, logs aur tables padho.</li>
<li>Haal ka change sabse common root cause hai; hamesha change log check karo.</li>
</ul></div>
`}};export{e as default};