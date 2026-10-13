var e={id:`lab-walkthroughs`,h:{en:`Lab walkthroughs: pn-ha-build, pn-ha-failover and pn-ha-ts`,hi:`Lab walkthroughs: pn-ha-build, pn-ha-failover aur pn-ha-ts`},body:{en:`
<p>A driving instructor does not drive the test route for you; they tell you what to look at in the mirror. This chapter does the same for the three labs of this module. It gives the thinking and the evidence to collect, but not the exact answers, because finding them is the training.</p>

<h3>Lab 1: pn-ha-build (build an active/passive pair)</h3>
<p><b>Situation:</b> a second Panorama, NK-PANORAMA-2 at 192.0.2.51, is installed but not configured. The original is NK-PANORAMA at 192.0.2.50.</p>
<ol>
<li>Start with <code>show high-availability state</code> on both. Note what it says before anything is configured.</li>
<li>Write the plan for each side: peer address, priority, preemption. Remember each side points at the other, and the primary is the one that should win the role back.</li>
<li>Configure one side, commit, read the state. What does it say while the peer is not yet configured?</li>
<li>Configure the other side, commit, read both states.</li>
<li>Prove synchronization from evidence: look at what the passive peer holds that you only configured on the original (managed devices, the template stack).</li>
<li>Answer the question about the secondary's state from your own output.</li>
</ol>
<p><b>Evidence you want:</b> a healthy output on both peers with the roles from your plan and a synchronized line.</p>

<h3>Lab 2: pn-ha-failover (fail over and keep managing firewalls)</h3>
<p><b>Situation:</b> the pair is up but the firewalls only know the primary.</p>
<ol>
<li>Look at <code>show panorama-status</code> on a firewall. How many servers does it list? Which template owns that setting?</li>
<li>Think about the order: edit, commit to Panorama, then push. Which push scope carries network settings to firewalls?</li>
<li>Re-read the firewall status. Do both servers appear, and what HA state does each show?</li>
<li>Take the primary out of the pair with the handover command from chapter 7. Read both Panoramas and the firewall status.</li>
<li>Which Panorama can you run the push on now? Run it there and read the job result.</li>
<li>Bring the primary back. Which peer should hold the active role if preemption is set? Verify on the pair and on a firewall.</li>
</ol>
<p><b>Evidence you want:</b> a firewall status with two servers, an accepted push from the second Panorama while the first is out, and the original layout restored.</p>

<h3>Lab 3: pn-ha-ts (the pair that will not form)</h3>
<p><b>Situation:</b> HA was configured in a window and both Panoramas believe they are on their own. There are two mistakes, one on each side, plus a broken election rule.</p>
<ol>
<li>Run the state on both peers. Read the bracketed sentence under the peer information on each; the two sentences are not the same.</li>
<li>For each peer ask: is the address I point at really the other Panorama? Compare with the planning table (192.0.2.50 and 192.0.2.51).</li>
<li>Then ask: do the two priorities differ? Look at the local priority lines.</li>
<li>Fix one cause on one side, commit, re-read both outputs, repeat.</li>
<li>Finish with a proof of synchronization, then answer the one-word question using the wording of the state output.</li>
</ol>
<p><b>Evidence you want:</b> before and after outputs on both peers and a synchronized line.</p>

<table class="tbl">
<tr><th>Lab</th><th>Main skill</th><th>Output to read first</th></tr>
<tr><td>pn-ha-build</td><td>Configure a mirror-image pair</td><td>show high-availability state, both peers</td></tr>
<tr><td>pn-ha-failover</td><td>Firewalls follow the active peer</td><td>show panorama-status on a firewall</td></tr>
<tr><td>pn-ha-ts</td><td>Read the peer line and compare</td><td>Peer information on both peers</td></tr>
</table>

<div class="tip"><p>Switch between the two Panoramas carefully. A configuration command typed on the wrong device is the usual reason a lab check does not pass.</p></div>

<div class="scn"><h4>Learner who read only one peer</h4><p>A learner spent twenty minutes on one Panorama's output and found the first mistake. The pair still did not form because the second mistake was visible only on the other peer. Reading both outputs from the start would have shown both in one minute.</p><p><b>Lesson:</b> in a pair, always compare both views.</p></div>

<div class="iv"><p class="q">"Walk me through verifying a new Panorama HA pair."</p><p>State on both peers shows one active and one passive with the intended roles, the synchronization line says synchronized, the passive peer holds the managed devices and templates configured on the active one, firewalls list both servers, and a planned suspend and resume hands over and returns the role.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan first, configure mirror images, verify on both peers.</li>
<li>Firewalls need the second server before failover helps.</li>
<li>Push only from the active Panorama.</li>
<li>Read both peers' peer-information lines when troubleshooting.</li>
</ul></div>
`,hi:`
<p>Driving instructor aapke liye test route nahi chalata; woh batata hai ki mirror mein kya dekhna hai. Yeh chapter is module ke teeno labs ke liye wahi karta hai. Yeh soch aur evidence batata hai jo collect karna hai, par exact answers nahi, kyunki unhe dhoondhna hi training hai.</p>

<h3>Lab 1: pn-ha-build (active/passive pair banao)</h3>
<p><b>Situation:</b> doosra Panorama, NK-PANORAMA-2 192.0.2.51 par, install hai par configure nahi. Original NK-PANORAMA 192.0.2.50 par hai.</p>
<ol>
<li>Dono par <code>show high-availability state</code> se shuru karo. Note karo kuch configure hone se pehle kya kehta hai.</li>
<li>Har side ka plan likho: peer address, priority, preemption. Yaad rakho har side doosre ko point karti hai, aur primary woh hai jo role wapas jeetna chahiye.</li>
<li>Ek side configure karo, commit karo, state padho. Jab peer abhi configure nahi hua tab kya kehta hai?</li>
<li>Doosri side configure karo, commit karo, dono states padho.</li>
<li>Evidence se synchronization prove karo: dekho passive peer ke paas kya hai jo aapne sirf original par configure kiya tha (managed devices, template stack).</li>
<li>Secondary ki state wala sawaal apne output se answer karo.</li>
</ol>
<p><b>Evidence jo chahiye:</b> dono peers par healthy output, aapke plan wale roles ke saath aur synchronized line.</p>

<h3>Lab 2: pn-ha-failover (fail over karo aur firewalls manage karte raho)</h3>
<p><b>Situation:</b> pair up hai par firewalls sirf primary ko jaante hain.</p>
<ol>
<li>Firewall par <code>show panorama-status</code> dekho. Kitne servers list karta hai? Woh setting kaun sa template own karta hai?</li>
<li>Order socho: edit, commit to Panorama, phir push. Kaun sa push scope network settings firewalls tak le jaata hai?</li>
<li>Firewall status dobara padho. Kya dono servers dikhte hain, aur har ek kaun si HA state dikhata hai?</li>
<li>Chapter 7 ke handover command se primary ko pair se bahar karo. Dono Panorama aur firewall status padho.</li>
<li>Ab push kis Panorama par chala sakte ho? Wahan chalao aur job result padho.</li>
<li>Primary ko wapas lao. Preemption set ho to active role kis peer ke paas hona chahiye? Pair aur firewall par verify karo.</li>
</ol>
<p><b>Evidence jo chahiye:</b> do servers wala firewall status, pehle ke bahar hone par doosre Panorama se accepted push, aur original layout restored.</p>

<h3>Lab 3: pn-ha-ts (woh pair jo ban nahi raha)</h3>
<p><b>Situation:</b> window mein HA configure hua aur dono Panorama khud ko akela maante hain. Do galtiyan hain, har side par ek, aur ek tooti hui election rule.</p>
<ol>
<li>Dono peers par state chalao. Har ek par peer information ke neeche bracket wala sentence padho; dono sentences ek jaise nahi hain.</li>
<li>Har peer ke liye poocho: jis address ko main point karta hoon kya woh sach mein doosra Panorama hai? Planning table se compare karo (192.0.2.50 aur 192.0.2.51).</li>
<li>Phir poocho: kya dono priorities alag hain? Local priority lines dekho.</li>
<li>Ek side par ek cause fix karo, commit karo, dono outputs dobara padho, repeat.</li>
<li>Synchronization ke proof se khatam karo, phir ek-shabd wala sawaal state output ki wording se answer karo.</li>
</ol>
<p><b>Evidence jo chahiye:</b> dono peers par before aur after outputs aur synchronized line.</p>

<table class="tbl">
<tr><th>Lab</th><th>Main skill</th><th>Pehle kaun sa output padho</th></tr>
<tr><td>pn-ha-build</td><td>Mirror-image pair configure karna</td><td>show high-availability state, dono peers</td></tr>
<tr><td>pn-ha-failover</td><td>Firewalls active peer ko follow karte hain</td><td>Firewall par show panorama-status</td></tr>
<tr><td>pn-ha-ts</td><td>Peer line padhna aur compare karna</td><td>Dono peers par Peer information</td></tr>
</table>

<div class="tip"><p>Dono Panoramas ke beech dhyaan se switch karo. Galat device par type kiya gaya configuration command lab check fail hone ki usual wajah hai.</p></div>

<div class="scn"><h4>Learner jisne sirf ek peer padha</h4><p>Ek learner ne bees minute ek Panorama ke output par lagaye aur pehli galti dhoondh li. Pair phir bhi nahi bana kyunki doosri galti sirf doosre peer par dikhti thi. Shuru se dono outputs padhte to ek minute mein dono dikh jaati.</p><p><b>Lesson:</b> pair mein hamesha dono views compare karo.</p></div>

<div class="iv"><p class="q">"Naye Panorama HA pair ko verify karne ka tareeka batao."</p><p>Dono peers par state ek active aur ek passive intended roles ke saath dikhaye, synchronization line synchronized kahe, passive peer ke paas woh managed devices aur templates hon jo active par configure kiye the, firewalls dono servers list karein, aur planned suspend aur resume role handover karke wapas lautaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle plan, mirror images configure karo, dono peers par verify karo.</li>
<li>Failover madad kare isse pehle firewalls ko doosra server chahiye.</li>
<li>Push sirf active Panorama se.</li>
<li>Troubleshooting mein dono peers ki peer-information lines padho.</li>
</ul></div>
`}};export{e as default};