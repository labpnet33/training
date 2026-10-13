var e={id:`how-labs-work`,h:{en:`How the labs work: tasks, checks and hints`,hi:`Labs kaise kaam karte hain: tasks, checks aur hints`},body:{en:`
<p>The labs run on a built-in simulator. They are not quizzes; you type real commands on virtual routers, and the lab checks the router state, not the words you typed. This chapter shows you how to work with that.</p>

<h3>Anatomy of a lab</h3>
<dl class="terms">
<dt>Brief</dt><dd>The story: who you are, what the customer wants, what is broken.</dd>
<dt>Tasks</dt><dd>A short ordered list. Each task has a check that looks at the simulated devices.</dd>
<dt>Check</dt><dd>A rule such as "PE2 has a prefix SID with index 5" or "the VRF table on PE1 holds 172.16.2.0/24". It passes the moment the state is right, however you got there.</dd>
<dt>Question tasks</dt><dd>Some tasks ask you to read an output and enter an answer, for example the label shown for PE2.</dd>
<dt>Hints</dt><dd>Three levels, from a nudge to the exact commands. Use them only after you tried.</dd></dl>

<h3>A working rhythm</h3>
<ol>
<li>Read the brief and the first task. Do not start typing yet.</li>
<li>Run the <b>show</b> command that tells you the current state.</li>
<li>Decide the smallest change that satisfies the task.</li>
<li>Apply it, then run the same show command again to confirm.</li>
<li>Only then press the check.</li>
</ol>
<pre class="code">PE1# show segment-routing mpls
<span class="hl">SRGB: 16000 - 23999</span>
PE1# show mpls forwarding-table
Local  Outgoing  Prefix          Next hop
16002  Pop       10.0.255.2/32   10.0.12.2
<span class="hl">16005  16005     10.0.255.5/32   10.0.12.2</span></pre>
<p>The highlighted lines are what you read the answers from. The first line tells you the SRGB base; the second shows that PE1 swaps label 16005 towards the next hop that leads to PE2.</p>

<h3>Making the most of failures</h3>
<p>A check that stays red is information. Compare the task text word by word with your configuration: wrong index, wrong router, a missing <code>no shutdown</code>. If a router will not accept a command, read the error before repeating it. The simulator reproduces real behaviours, including the silent ones, such as a missing extended community that breaks a VPN without raising any error.</p>

<div class="eg"><b>Worked example.</b> Task: "enable SR on PE2 with index 5". You apply the SID map, but the label does not appear. The show output reveals that <code>segment-routing mpls</code> is missing under <code>router isis</code>. You add it, repeat the show command, see 16005, and then press check.</div>

<div class="warn"><b>Common mistake.</b> Copying a solution from memory without looking at the device first. Labs start in different broken states each time, so the same commands do not always apply.</div>

<div class="scn"><h4>The hint that was used too early</h4><p>A learner opened hint three in under a minute and typed the answer. The check turned green but, a week later, she could not repeat it in the troubleshooting lab. After that she set herself a rule: ten minutes with show commands before any hint.</p><p><b>Lesson:</b> a hint saves minutes today and costs hours later.</p></div>

<div class="iv"><p class="q">"How do you verify a change you made?"</p><p>Say that you check the device state with a show command before and after, and test the service end to end with a ping or traceroute, rather than trusting that the command was accepted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Checks look at device state, not at what you typed.</li>
<li>Show first, change small, show again, then check.</li>
<li>Use hints last; read the red check as a clue.</li>
</ul></div>
`,hi:`
<p>Labs ek built-in simulator par chalte hain. Yeh quizzes nahi hain; aap virtual routers par asli commands type karte ho, aur lab router ki state check karta hai, aapke type kiye shabd nahi. Yeh chapter batata hai ki isse kaise kaam karna hai.</p>

<h3>Lab ka dhaancha</h3>
<dl class="terms">
<dt>Brief</dt><dd>Kahani: aap kaun ho, customer kya chahta hai, kya toota hua hai.</dd>
<dt>Tasks</dt><dd>Chhoti ordered list. Har task ka check simulated devices ko dekhta hai.</dd>
<dt>Check</dt><dd>Ek rule jaise "PE2 ke paas index 5 wala prefix SID hai" ya "PE1 ke VRF table mein 172.16.2.0/24 hai". Jaise hi state sahi hoti hai pass ho jaata hai, chahe aap kisi bhi tareeke se pahunche ho.</dd>
<dt>Question tasks</dt><dd>Kuch tasks output padhkar jawab likhne ko kehte hain, jaise PE2 ke liye dikhne wala label.</dd>
<dt>Hints</dt><dd>Teen levels, halke ishaare se lekar exact commands tak. Koshish karne ke baad hi use karo.</dd></dl>

<h3>Kaam karne ki lay</h3>
<ol>
<li>Brief aur pehla task padho. Abhi type mat karo.</li>
<li>Woh <b>show</b> command chalao jo current state batata hai.</li>
<li>Sabse chhota change socho jo task ko satisfy kare.</li>
<li>Lagao, phir wahi show command dobara chalakar confirm karo.</li>
<li>Tab hi check dabao.</li>
</ol>
<pre class="code">PE1# show segment-routing mpls
<span class="hl">SRGB: 16000 - 23999</span>
PE1# show mpls forwarding-table
Local  Outgoing  Prefix          Next hop
16002  Pop       10.0.255.2/32   10.0.12.2
<span class="hl">16005  16005     10.0.255.5/32   10.0.12.2</span></pre>
<p>Highlighted lines se aap jawab padhte ho. Pehli line SRGB base batati hai; doosri dikhati hai ki PE1 PE2 tak le jaane wale next hop ki taraf label 16005 swap karta hai.</p>

<h3>Failures ka poora faayda</h3>
<p>Lal rehta check ek jaankari hai. Task ka text shabd-ba-shabd apni configuration se milao: galat index, galat router, chhoota hua <code>no shutdown</code>. Agar router command accept nahi karta, dobara karne se pehle error padho. Simulator asli behaviours reproduce karta hai, chupchaap wale bhi, jaise missing extended community jo bina error ke VPN tod deta hai.</p>

<div class="eg"><b>Worked example.</b> Task: "PE2 par index 5 ke saath SR enable karo". Aap SID map lagate ho, par label nahi dikhta. Show output batata hai ki <code>router isis</code> ke neeche <code>segment-routing mpls</code> missing hai. Aap use jodte ho, show command dobara chalate ho, 16005 dikhta hai, aur tab check dabate ho.</div>

<div class="warn"><b>Common mistake.</b> Device dekhe bina yaad se solution copy karna. Labs har baar alag broken state mein shuru hote hain, isliye wahi commands hamesha kaam nahi karte.</div>

<div class="scn"><h4>Jo hint jaldi khul gaya</h4><p>Ek learner ne ek minute se kam mein hint teen khola aur jawab type kar diya. Check hara ho gaya, par ek hafte baad woh troubleshooting lab mein use dohra nahi paayi. Uske baad usne rule banaya: kisi bhi hint se pehle show commands ke saath das minute.</p><p><b>Lesson:</b> hint aaj minutes bachata hai aur baad mein ghante leta hai.</p></div>

<div class="iv"><p class="q">"Aap apne kiye change ko kaise verify karte ho?"</p><p>Kaho ki aap change se pehle aur baad mein show command se device state dekhte ho, aur service ko end to end ping ya traceroute se test karte ho, yeh maan kar nahi chalte ki command accept ho gaya to kaam ho gaya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Checks device state dekhte hain, aapka type kiya hua nahi.</li>
<li>Pehle show, chhota change, phir show, phir check.</li>
<li>Hints sabse aakhir mein; lal check ko clue samjho.</li>
</ul></div>
`}};export{e as default};