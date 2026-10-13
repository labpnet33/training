var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: voice drops, a class that gets nothing, a policy that is rejected`,hi:`Troubleshooting workflow: voice drops, jis class ko kuch nahi milta, aur reject hui policy`},body:{en:`
<p>Queuing faults share a nasty property: the configuration usually <i>looks</i> right. The class-maps exist, the policy-map has sensible numbers, and yet calls break up. A good engineer does not stare at the configuration; he follows a fixed method that turns the symptom into a measurement. This chapter gives you that method, the three classic symptoms, and a walk through the troubleshooting lab at the end of this module.</p>

<h3>Think of a doctor with a checklist</h3>
<p>A doctor who hears "I feel unwell" does not start surgery. She checks temperature, pulse and blood pressure in the same order every time, and the numbers point to the cause. We do the same with four checks, always in order.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting flow for queuing problems">
<rect x="10" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">1. Attached?</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="11">right interface, output</text>
<rect x="170" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="13">2. Classified?</text><text x="240" y="62" text-anchor="middle" class="svg-muted" font-size="11">matched packets, order</text>
<rect x="330" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="44" text-anchor="middle" class="svg-ink" font-size="13">3. Numbers?</text><text x="400" y="62" text-anchor="middle" class="svg-muted" font-size="11">rates, sum, priority</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">4. Bottleneck?</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="11">is it this interface</text>
<path d="M150 48 H170 M310 48 H330 M470 48 H490" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="11">empty show output</text><text x="240" y="110" text-anchor="middle" class="svg-muted" font-size="11">0 packets in class</text><text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="11">drops in wrong class</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">no drops, still slow</text>
<path d="M80 80 V96 M240 80 V96 M400 80 V96 M560 80 V96" stroke="#64748b" stroke-width="1.5" fill="none"/>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Stop at the first check that fails and fix it, then repeat the load test.</text>
<text x="320" y="182" text-anchor="middle" class="svg-accent" font-size="12">Never change two things at once: you will not know which one worked.</text>
</svg><p class="cap">Four checks, one clue under each. Each clue is a symptom you can see in show policy-map interface.</p></div>

<h3>Symptom A: voice drops under load</h3>
<p>Calls are fine all day and break up when a big transfer starts. Work through the four checks:</p>
<ul>
<li><b>Attached?</b> The congested interface must show <code>Service-policy output</code>. If the output is empty, see Symptom C.</li>
<li><b>Classified?</b> Is the voice counted in VOICE-Q? If VOICE-Q has 0 packets and voice is running, either the phones do not send EF (check the marking from the previous module) or an <b>earlier class in the policy matches first</b>. The router tests classes top to bottom, so a broad class such as one matching all UDP, placed above the voice class, quietly takes the voice packets into the wrong queue.</li>
<li><b>Numbers?</b> In the priority class, a rising <code>b/w exceed drops</code> means the rate is smaller than the voice load. The line <code>Priority: Strict</code>, with no rate, is a warning that the queue has no ceiling.</li>
<li><b>Bottleneck?</b> If no class drops anything and calls still suffer, the queue may be in a device you do not control, for example the provider's equipment behind a gigabit hand-off.</li>
</ul>

<pre class="out">    Class-map: VOICE-Q (match-any)
      <span class="hl">0 packets, 0 bytes</span>
      Match: dscp ef (46)
    Class-map: ANY-UDP-Q (match-any)
      <span class="hl">31200 packets, 6240000 bytes</span>
      Match: protocol udp
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">9100</span>/0</pre>
<p>Reading this clue: voice is running (UDP, the volume proves it), VOICE-Q sees nothing, and the broad class that also matches UDP is counting everything and dropping. The cause is class order. To move a class in a policy-map you remove it and add it again, which places it below the existing classes; remember to configure its queuing command again.</p>

<h3>Symptom B: a class that gets nothing</h3>
<p>Look at the counters of the starving class:</p>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Next step</th></tr>
<tr><td>0 packets matched</td><td>Traffic carries a different DSCP, the ACL does not match, or an earlier class takes it</td><td>Compare show class-map with the marking on the wire; check the order</td></tr>
<tr><td>Many packets, all dropped</td><td>Guarantee far too small (for example 5 percent of a 2 Mbps link is 100 kbps) or a policer in the class</td><td>Check the bandwidth line in kbps and the offered rate</td></tr>
<tr><td>Packets pass, but slowly</td><td>Long queue-limit adds delay, or the class is not the bottleneck</td><td>Check queue limit and the end-to-end delay</td></tr>
<tr><td>A class beneath a priority class is squeezed</td><td>Priority class has no rate, or its rate is too large</td><td>Look at the Priority line and exceed drops</td></tr>
</table>

<h3>Symptom C: the policy is rejected or silently absent</h3>
<p>The most confusing case: the configuration shows a policy-map, but <code>show policy-map interface</code> prints nothing. When a service-policy is refused, the interface simply has no policy, and in a stored configuration that is loaded at boot the refusal may not be noticed at all. Try the attachment yourself and read the message:</p>
<pre class="out">R1(config-if)# service-policy output EDGE-OUT
<span class="hl">I/f GigabitEthernet0/0 class BKP-Q requested bandwidth 4000 (kbps), available only 3000 (kbps)</span>
% Service policy EDGE-OUT not attached</pre>
<p>The message names the class and tells how much of the interface was already promised. The sum of the guarantees in front of that class exceeds what the interface can give. Other rejections you will meet:</p>
<pre class="out">R1(config-pmap-c)# bandwidth 300
<span class="hl">% All classes with bandwidth must use the same unit (kbps or percent)</span>

R1(config-if)# service-policy input EDGE-OUT
<span class="hl">Queueing actions (priority, bandwidth, shape, fair-queue) are allowed only in the output direction</span>
% Service policy EDGE-OUT not attached to GigabitEthernet0/1 input</pre>
<p>On real IOS XE the wording differs a little, and many platforms also apply the 75 percent <code>max-reserved-bandwidth</code> rule, but the pattern is the same: the message names the class and the problem, and the policy is not attached.</p>

<h3>Walking the lab: voice drops and a policy that never attaches</h3>
<p>The troubleshooting lab of this module gives you exactly the situation of Symptoms A, B and C together. You will not find the answer here, only the path.</p>
<ol>
<li><b>Start with the symptom you can see:</b> the show output for the WAN interface is empty although a policy-map exists. That points to Check 1. Print the policy with <code>show policy-map</code> and try to attach it by hand. Add up the guarantees in front of the class named in the error and compare with the circuit rate.</li>
<li><b>Once the policy is attached, run a voice flow and a bulk flow</b> and read which class counts the voice. If the voice class has no packets, check the class order and the matches. Ask yourself which class could match a voice packet before the voice class does.</li>
<li><b>Read the priority line.</b> Does it carry a rate? A rate-less priority class is a design fault even if no counter shows it yet.</li>
<li><b>Prove the repair</b> with a load test that includes a misbehaving EF sender, and confirm that the protected business class loses nothing while the priority policer shows exceed drops.</li>
</ol>
<p>Fix one fault at a time and re-test after each. The order of discovery follows the checks above, from attachment to classification to numbers.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing the configuration before reading the counters. (2) Fixing two things at once. (3) Trusting the running-config as proof that a policy is active. (4) Testing without load. (5) Forgetting that a policy on an interface that is not the bottleneck has nothing to schedule.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Voice class has zero matched packets but phones are marking EF. What is the most likely cause?" A class listed above it matches the voice packets first. "A policy-map exists but show policy-map interface is empty. Why?" It is not attached, often because the attach was rejected.</p></div>

<div class="scn"><h4>Friday night at Zenith Logistics</h4><p>On Friday evening the Pune warehouse reported broken calls to Mumbai. The on-call engineer logged in, ran show policy-map interface on the WAN port and got no output. The configuration of WAN-OUT looked perfect. She attached it again by hand and the router refused it, quoting a class and the bandwidth still available. Months earlier someone had raised a bandwidth value, and the sum had passed the interface rate, but since the router had been up for a year nobody noticed until a reload after a power cut loaded the config and silently dropped the attachment. She lowered the guarantees to fit, attached the policy, and re-ran a call under load: zero loss.</p><p><b>Lesson:</b> an empty show policy-map interface is a finding, not a missing output. Always try the attach and read the error.</p></div>

<div class="iv"><p class="q">"Users say calls break up at night. Walk me through how you troubleshoot."</p><p>I would first confirm congestion with interface output drops and utilisation, then check that the policy is attached outbound on the bottleneck interface. Next I would read the per-class counters under load: is voice matched in the priority class, are there exceed drops, is an earlier class capturing it? Then I would compare the numbers with the design: priority rate against the number of calls, the sum of guarantees against the interface. I change one thing at a time and repeat the load test, and I keep in mind that the bottleneck may be beyond my router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow four checks in order: attached, classified, numbers, bottleneck.</li>
<li>A class with zero matched packets means classification, marking or class order, not bandwidth.</li>
<li>Classes are matched top to bottom; a broad class above a narrow one steals its traffic.</li>
<li>An empty show policy-map interface usually means the policy is not attached; try the attach and read the error.</li>
<li>Priority without a rate, or with too small a rate, is a design fault; read the Priority line and exceed drops.</li>
</ul></div>
`,hi:`
<p>Queuing faults mein ek buri baat hoti hai: configuration aam taur par theek <i>dikhta</i> hai. Class-maps maujood hain, policy-map mein samajhdaar numbers hain, phir bhi calls tooti hain. Achha engineer configuration ko ghoorta nahi; woh ek fixed tareeka follow karta hai jo symptom ko measurement mein badal deta hai. Yeh chapter aapko woh tareeka, teen classic symptoms, aur is module ki aakhri troubleshooting lab ka walk-through deta hai.</p>

<h3>Checklist wale doctor ki tarah socho</h3>
<p>Jo doctor "mujhe theek nahi lag raha" sunkar surgery shuru nahi karti. Woh har baar ek hi order mein temperature, pulse aur blood pressure check karti hai, aur numbers wajah ki taraf ishara karte hain. Hum bhi chaar checks se wahi karte hain, hamesha order mein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting flow for queuing problems">
<rect x="10" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">1. Attached?</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="11">sahi interface, output</text>
<rect x="170" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="13">2. Classified?</text><text x="240" y="62" text-anchor="middle" class="svg-muted" font-size="11">matched packets, order</text>
<rect x="330" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="44" text-anchor="middle" class="svg-ink" font-size="13">3. Numbers?</text><text x="400" y="62" text-anchor="middle" class="svg-muted" font-size="11">rates, sum, priority</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">4. Bottleneck?</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="11">kya yahi interface hai</text>
<path d="M150 48 H170 M310 48 H330 M470 48 H490" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="11">khali show output</text><text x="240" y="110" text-anchor="middle" class="svg-muted" font-size="11">class mein 0 packets</text><text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="11">galat class mein drops</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">drops nahi, phir bhi slow</text>
<path d="M80 80 V96 M240 80 V96 M400 80 V96 M560 80 V96" stroke="#64748b" stroke-width="1.5" fill="none"/>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Jo pehla check fail ho wahin ruko aur use theek karo, phir load test dohrao.</text>
<text x="320" y="182" text-anchor="middle" class="svg-accent" font-size="12">Ek saath do cheezein kabhi mat badlo: pata nahi chalega kaunsi kaam aayi.</text>
</svg><p class="cap">Chaar checks, har ek ke neeche ek clue. Har clue show policy-map interface mein dikhne wala symptom hai.</p></div>

<h3>Symptom A: load mein voice drop hoti hai</h3>
<p>Calls din bhar theek chalti hain aur bada transfer shuru hote hi tootne lagti hain. Chaar checks se guzro:</p>
<ul>
<li><b>Attached?</b> Congested interface par <code>Service-policy output</code> dikhna chahiye. Output khali ho to Symptom C dekho.</li>
<li><b>Classified?</b> Kya voice VOICE-Q mein ginti ja rahi hai? Agar voice chal rahi hai aur VOICE-Q mein 0 packets hain, to ya to phones EF nahi bhej rahe (pichhle module ki marking check karo) ya <b>policy ki koi pehle wali class pehle match kar rahi hai</b>. Router classes ko upar se neeche test karta hai, isliye jo broad class saara UDP match karti ho aur voice class ke upar baithi ho woh chupke se voice packets ko galat queue mein le jaati hai.</li>
<li><b>Numbers?</b> Priority class mein badhta <code>b/w exceed drops</code> ka matlab rate voice load se chhota hai. Bina rate wali <code>Priority: Strict</code> line chetavni hai ki queue ki koi ceiling nahi.</li>
<li><b>Bottleneck?</b> Agar koi class kuch drop nahi kar rahi aur calls phir bhi kharab hain, to queue aise device mein ho sakti hai jo aapke control mein nahi, jaise gigabit hand-off ke peeche provider ka equipment.</li>
</ul>

<pre class="out">    Class-map: VOICE-Q (match-any)
      <span class="hl">0 packets, 0 bytes</span>
      Match: dscp ef (46)
    Class-map: ANY-UDP-Q (match-any)
      <span class="hl">31200 packets, 6240000 bytes</span>
      Match: protocol udp
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">9100</span>/0</pre>
<p>Is clue ko aise padho: voice chal rahi hai (UDP, volume saboot hai), VOICE-Q ko kuch dikhta nahi, aur jo broad class UDP bhi match karti hai woh sab kuch gin rahi hai aur drop kar rahi hai. Wajah class order hai. Policy-map mein class ko hilane ke liye use hata kar dobara jodte hain, jisse woh maujooda classes ke neeche aa jaati hai; uska queuing command phir se configure karna yaad rakho.</p>

<h3>Symptom B: jis class ko kuch nahi milta</h3>
<p>Bhookhi class ke counters dekho:</p>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sambhavit wajah</th><th>Agla kadam</th></tr>
<tr><td>0 packets matched</td><td>Traffic ka DSCP alag hai, ACL match nahi karti, ya pehle wali class use le leti hai</td><td>show class-map ko wire par marking se compare karo; order check karo</td></tr>
<tr><td>Bahut packets, sab dropped</td><td>Guarantee bahut chhoti (jaise 2 Mbps link ka 5 percent matlab 100 kbps) ya class mein policer</td><td>kbps mein bandwidth line aur offered rate dekho</td></tr>
<tr><td>Packets nikalte hain, lekin dheere</td><td>Lambi queue-limit delay jodti hai, ya class bottleneck nahi hai</td><td>Queue limit aur end-to-end delay dekho</td></tr>
<tr><td>Priority class ke neeche wali class dabi hui hai</td><td>Priority class mein rate nahi, ya rate bahut bada</td><td>Priority line aur exceed drops dekho</td></tr>
</table>

<h3>Symptom C: policy reject hui hai ya chupke se gayab hai</h3>
<p>Sabse confusing case: configuration mein policy-map dikhta hai, lekin <code>show policy-map interface</code> kuch nahi chhaapta. Jab service-policy mana kar di jaati hai, interface par bas koi policy hoti hi nahi, aur boot par load hone wali stored configuration mein mana kiya jaana dikh bhi na sakta hai. Khud attach karke dekho aur message padho:</p>
<pre class="out">R1(config-if)# service-policy output EDGE-OUT
<span class="hl">I/f GigabitEthernet0/0 class BKP-Q requested bandwidth 4000 (kbps), available only 3000 (kbps)</span>
% Service policy EDGE-OUT not attached</pre>
<p>Message class ka naam batata hai aur kitna interface pehle se promise ho chuka hai. Us class se pehle ki guarantees ka sum interface jitna de sakta hai usse zyada hai. Aur kuch rejections jo milenge:</p>
<pre class="out">R1(config-pmap-c)# bandwidth 300
<span class="hl">% All classes with bandwidth must use the same unit (kbps or percent)</span>

R1(config-if)# service-policy input EDGE-OUT
<span class="hl">Queueing actions (priority, bandwidth, shape, fair-queue) are allowed only in the output direction</span>
% Service policy EDGE-OUT not attached to GigabitEthernet0/1 input</pre>
<p>Asli IOS XE par wording thodi alag hoti hai, aur kai platforms 75 percent <code>max-reserved-bandwidth</code> niyam bhi lagate hain, lekin pattern wahi hai: message class aur dikkat ka naam batata hai, aur policy attach nahi hoti.</p>

<h3>Lab ka walk-through: voice drops aur woh policy jo attach nahi hoti</h3>
<p>Is module ki troubleshooting lab aapko Symptoms A, B aur C ki wahi situation ek saath deti hai. Jawab yahan nahi milega, sirf raasta.</p>
<ol>
<li><b>Jo symptom dikhta hai usse shuru karo:</b> WAN interface ka show output khali hai jabki policy-map maujood hai. Yeh Check 1 ki taraf ishara karta hai. <code>show policy-map</code> se policy chhaapo aur use haath se attach karke dekho. Error mein bataayi class se pehle ki guarantees jodo aur circuit rate se compare karo.</li>
<li><b>Policy attach hone ke baad voice flow aur bulk flow chalao</b> aur padho ki voice kaun si class ginti hai. Voice class mein packets na hon to class order aur matches check karo. Khud se poochho ki voice class se pehle kaun si class voice packet ko match kar sakti hai.</li>
<li><b>Priority line padho.</b> Kya usme rate hai? Bina rate wali priority class design fault hai chahe abhi koi counter use na dikhaye.</li>
<li><b>Repair ko saabit karo</b> aisi load test se jisme ek galat behave karne wala EF sender shamil ho, aur confirm karo ki protected business class kuch nahi khoti jabki priority policer exceed drops dikhata hai.</li>
</ol>
<p>Ek samay mein ek fault theek karo aur har baar re-test karo. Khoj ka order upar ke checks ko follow karta hai, attachment se classification se numbers tak.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Counters padhne se pehle configuration badalna. (2) Ek saath do cheezein theek karna. (3) Running-config ko is baat ka saboot maanna ki policy active hai. (4) Bina load ke test karna. (5) Bhool jaana ki jo interface bottleneck nahi hai us par policy ke paas schedule karne ko kuch nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Voice class mein zero matched packets hain lekin phones EF mark kar rahe hain. Sabse sambhavit wajah?" Uske upar likhi koi class voice packets ko pehle match kar leti hai. "Policy-map hai lekin show policy-map interface khali hai. Kyun?" Woh attach nahi hai, aksar attach reject hone ki wajah se.</p></div>

<div class="scn"><h4>Zenith Logistics ki Friday raat</h4><p>Friday shaam Pune warehouse ne Mumbai ki toot-ti calls report ki. On-call engineer ne login karke WAN port par show policy-map interface chalaya aur koi output nahi mila. WAN-OUT ka configuration bilkul theek dikhta tha. Usne use haath se dobara attach kiya aur router ne mana kar diya, ek class aur bachi hui bandwidth batate hue. Mahino pehle kisi ne ek bandwidth value badhayi thi, aur sum interface rate se paar ho gaya tha, lekin router saal bhar se chal raha tha isliye kisi ko pata nahi chala jab tak power cut ke baad reload ne config load karke attachment chupke se gira nahi diya. Usne guarantees ko fit hone tak ghataya, policy attach ki, aur load mein call dobara chalayi: zero loss.</p><p><b>Lesson:</b> khali show policy-map interface ek finding hai, missing output nahi. Hamesha attach karke dekho aur error padho.</p></div>

<div class="iv"><p class="q">"Users kehte hain raat ko calls tooti hain. Aap troubleshoot kaise karoge, mujhe batao."</p><p>Main pehle interface output drops aur utilisation se congestion confirm karunga, phir check karunga ki policy bottleneck interface par outbound attach hai. Phir load mein per-class counters padhunga: kya voice priority class mein match ho rahi hai, kya exceed drops hain, kya koi pehle wali class use le rahi hai? Phir numbers ko design se compare karunga: calls ke mukable priority rate, interface ke mukable guarantees ka sum. Main ek samay mein ek cheez badalta hoon aur load test dohraata hoon, aur yaad rakhta hoon ki bottleneck mere router ke aage bhi ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar checks order mein: attached, classified, numbers, bottleneck.</li>
<li>Zero matched packets wali class ka matlab classification, marking ya class order, bandwidth nahi.</li>
<li>Classes upar se neeche match hoti hain; narrow class ke upar broad class uska traffic chura leti hai.</li>
<li>Khali show policy-map interface ka matlab aksar policy attach nahi hai; attach karke error padho.</li>
<li>Bina rate ya bahut chhote rate wali priority design fault hai; Priority line aur exceed drops padho.</li>
</ul></div>
`}};export{e as default};