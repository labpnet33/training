var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: when traffic lands in class-default`,hi:`Troubleshooting workflow: jab traffic class-default mein jaaye`},body:{en:`
<p>The most common marking complaint is simple to state: "I wrote the policy, but my traffic still lands in class-default." The router is not broken. It is following your configuration exactly, and the configuration does not describe the traffic the way you think it does. This chapter gives you a method that works on any such case and walks the clues of the fourth lab, <b>mq-mark-mismatch</b>, without handing you the answer. Try the lab after reading, with the method open next to you.</p>

<h3>The method: widen, narrow, prove</h3>
<ol>
<li><b>Reproduce.</b> Start the traffic that complains and confirm the symptom with numbers: which flow, which DSCP at the far end, how many packets in class-default. A problem you cannot measure you cannot prove fixed.</li>
<li><b>Find the point of loss.</b> Work along the path in the direction of the packet. At which interface and direction does the policy sit, and does the packet pass there?</li>
<li><b>Check the attachment.</b> Right interface, right direction, policy actually attached.</li>
<li><b>Check each class, in order.</b> The first match wins, so read the policy from the top and ask of every class: could this packet match here?</li>
<li><b>Check each match.</b> Type of class (any or all), the match lines, the ACL contents, port ranges, protocol, address direction.</li>
<li><b>Change one thing, test, read counters.</b> Never edit three things at once. You will not know which one worked, and you may hide a second fault.</li>
<li><b>Prove.</b> Fresh traffic, counters in the right class, marked count moving, and the far side seeing the DSCP.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting flow">
<rect x="10" y="40" width="100" height="50" rx="8" fill="#fde68a"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="13">Reproduce</text>
<rect x="135" y="40" width="100" height="50" rx="8" fill="#bae6fd"/><text x="185" y="70" text-anchor="middle" class="svg-ink" font-size="13">Attachment</text>
<rect x="260" y="40" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="310" y="70" text-anchor="middle" class="svg-ink" font-size="13">Class order</text>
<rect x="385" y="40" width="100" height="50" rx="8" fill="#fecaca"/><text x="435" y="70" text-anchor="middle" class="svg-ink" font-size="13">Match detail</text>
<rect x="510" y="40" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">Prove it</text>
<line x1="110" y1="65" x2="135" y2="65" stroke="#64748b" stroke-width="2"/><line x1="235" y1="65" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="360" y1="65" x2="385" y2="65" stroke="#64748b" stroke-width="2"/><line x1="485" y1="65" x2="510" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">one change per loop, counters read every time</text>
</svg><p class="cap">Work from the outside in: attachment first, then class order, then the detail inside each match.</p></div>

<h3>The clues, one by one</h3>
<p><b>Clue 1: the direction line.</b> Run <code>show policy-map interface</code> for the interface and read the first line after its name. A marking policy that is meant to catch traffic coming from the LAN must be attached in the <i>input</i> direction on the LAN-facing interface. If the line reads <code>Service-policy output</code>, the policy is looking at traffic leaving, which is a different set of packets. Counters sit at zero in every class because no packet of that kind ever passes in that direction.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1 output
 GigabitEthernet0/1

  Service-policy output: MARK-IN

    Class-map: VOICE (match-any)
      0 packets, 0 bytes
      QoS Set
        dscp ef
          <span class="hl">Packets marked 0</span></pre>
<p>Notice the policy name says <i>IN</i> and the line says <i>output</i>. Names do not enforce anything. Believe the line, not the name.</p>

<p><b>Clue 2: counters per class.</b> After the direction is right, the next question is where packets go instead. Large numbers in class-default while a named class shows few or none tell you the named class did not recognise the traffic. Note which flows were affected. If the phone is in class-default but the web traffic is classified, the fault is specific to the voice class, not to the policy as a whole.</p>

<p><b>Clue 3: the ACL range.</b> When a class points to an ACL, open the ACL with <code>show ip access-lists NAME</code> and compare it with the application. Voice media normally uses UDP in the RTP range <code>16384</code> to <code>32767</code>. If the ACL permits a smaller slice of that range, some calls match and some do not, which is the nastiest kind of fault because a quick test may pass. Test with the exact port your device uses, then read the ACL line by line.</p>

<p><b>Clue 4: any or all.</b> Look at the class-map header in <code>show class-map</code>. A class with two protocol lines such as http and secure-http is meant to catch either. If the header says <b>match-all</b>, the packet must satisfy both lines at once, and a single TCP packet is never both protocols. The class then matches nothing at all while looking perfectly reasonable in the configuration. Read the header word first, then the lines.</p>

<h3>Order of checking matters</h3>
<p>It is tempting to start with the ACL because ACLs feel like where mistakes live. Resist it. If the policy is attached in the wrong direction, a perfect ACL still shows nothing and you will waste time editing a correct object. Start from the outside: is the policy on the right interface in the right direction; then which class gets the packets; then the match detail. Also remember that more than one fault can exist together. After fixing the first, run the test again and read the counters again. A partial recovery is a clue, not a victory.</p>
<table class="cmp"><tr><th>Symptom</th><th>First thing to check</th></tr>
<tr><td>Every class at zero</td><td>Direction and attachment in the policy line</td></tr>
<tr><td>One class empty, others fine</td><td>That class: ACL contents, match type</td></tr>
<tr><td>Works for some calls, not others</td><td>Port range or address range inside the ACL</td></tr>
<tr><td>Marks fine here, wrong at far end</td><td>A device after this one that re-marks (trust boundary)</td></tr>
</table>

<h3>Prove the repair</h3>
<p>The lab ends with a proof task for a reason. After your changes, start the flows again, read each class counter, check that <code>Packets marked</code> moves in the right classes, and confirm in <code>traffic show</code> that the phone flow shows 0.0 percent loss. If you cannot show a before and an after, you have a guess, not a fix.</p>

<div class="warn"><p><b>Common mistake.</b> Rewriting the whole policy instead of finding the fault. A fresh policy usually reproduces the same wrong idea. Read, locate, change one line.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match-all with two protocol lines matches nothing. A policy name is just a label; direction is set by the service-policy command. First match wins, so an early broad class can swallow traffic meant for a later one.</p></div>

<div class="scn"><h4>Half of the calls were marked</h4><p>A Jaipur contact centre complained that some calls were clear and some were choppy. The ACL permitted UDP ports 16384 to 17000 only. The phone system used ports across the whole RTP range, so calls that landed on a low port were marked and the others went to class-default. The engineer found it by comparing the ACL line with the port shown in the flow list.</p><p><b>Lesson:</b> intermittent usually means a range that covers only part of the traffic.</p></div>
<div class="iv"><p class="q">"Traffic is landing in class-default. What do you check?"</p><p>Confirm the symptom with counters, then check where the policy is attached and in which direction, then which class should have caught the traffic, then the class type and the ACL contents. Change one thing at a time and prove with fresh traffic and far-end results.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: reproduce, check attachment, check class order, check match detail, change one thing, prove.</li>
<li>Direction comes from the service-policy line, not from the policy name.</li>
<li>Compare ACL port ranges with what the application really uses.</li>
<li>Match-all needs every line true at once; match-any needs one.</li>
<li>Faults can stack: read counters again after each fix.</li>
</ul></div>
`,hi:`
<p>Sabse aam marking complaint kehna aasaan hai: "Maine policy likhi, phir bhi mera traffic class-default mein jaa raha hai." Router kharaab nahi hai. Woh aapki configuration ko bilkul waisa follow kar raha hai, aur configuration traffic ko us tarah describe nahi karti jaise aap sochte ho. Yeh chapter ek aisa method deta hai jo har aise case par chalta hai aur chauthe lab, <b>mq-mark-mismatch</b>, ke clues bina jawab diye dikhata hai. Padhne ke baad lab try karo, method saath mein khula rakhke.</p>

<h3>Method: widen, narrow, prove</h3>
<ol>
<li><b>Reproduce.</b> Jo traffic complain kar raha hai woh chalao aur numbers se symptom confirm karo: kaun sa flow, door ke end par kaun sa DSCP, class-default mein kitne packets. Jo problem naap nahi sakte use fixed sabit nahi kar sakte.</li>
<li><b>Loss ka point dhundo.</b> Packet ki direction mein path par chalo. Policy kis interface aur direction par hai, aur kya packet wahan se guzarta hai?</li>
<li><b>Attachment check karo.</b> Sahi interface, sahi direction, policy sach mein attached.</li>
<li><b>Har class check karo, order mein.</b> First match wins, isliye policy ko upar se padho aur har class se poochho: kya yeh packet yahan match ho sakta hai?</li>
<li><b>Har match check karo.</b> Class ka type (any ya all), match lines, ACL ke contents, port ranges, protocol, address ki direction.</li>
<li><b>Ek cheez badlo, test karo, counters padho.</b> Kabhi teen cheezein ek saath mat badlo. Pata nahi chalega kaunsi chali, aur ho sakta hai doosra fault chhup jaaye.</li>
<li><b>Prove karo.</b> Fresh traffic, sahi class mein counters, marked count badhta hua, aur door ka side DSCP dekhta hua.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting flow">
<rect x="10" y="40" width="100" height="50" rx="8" fill="#fde68a"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="13">Reproduce</text>
<rect x="135" y="40" width="100" height="50" rx="8" fill="#bae6fd"/><text x="185" y="70" text-anchor="middle" class="svg-ink" font-size="13">Attachment</text>
<rect x="260" y="40" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="310" y="70" text-anchor="middle" class="svg-ink" font-size="13">Class order</text>
<rect x="385" y="40" width="100" height="50" rx="8" fill="#fecaca"/><text x="435" y="70" text-anchor="middle" class="svg-ink" font-size="13">Match detail</text>
<rect x="510" y="40" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">Prove it</text>
<line x1="110" y1="65" x2="135" y2="65" stroke="#64748b" stroke-width="2"/><line x1="235" y1="65" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="360" y1="65" x2="385" y2="65" stroke="#64748b" stroke-width="2"/><line x1="485" y1="65" x2="510" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">one change per loop, counters read every time</text>
</svg><p class="cap">Bahar se andar kaam karo: pehle attachment, phir class order, phir har match ke andar ki detail.</p></div>

<h3>Clues, ek ek karke</h3>
<p><b>Clue 1: direction line.</b> Interface ke liye <code>show policy-map interface</code> chalao aur naam ke baad ki pehli line padho. Jo marking policy LAN se aane wale traffic ko pakadne ke liye hai woh LAN-facing interface par <i>input</i> direction mein lagni chahiye. Agar line <code>Service-policy output</code> kehti hai, to policy nikalte traffic ko dekh rahi hai, jo packets ka alag set hai. Har class mein counters zero rehte hain kyunki us direction mein us tarah ka koi packet guzarta hi nahi.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1 output
 GigabitEthernet0/1

  Service-policy output: MARK-IN

    Class-map: VOICE (match-any)
      0 packets, 0 bytes
      QoS Set
        dscp ef
          <span class="hl">Packets marked 0</span></pre>
<p>Dhyan do ki policy ka naam <i>IN</i> kehta hai aur line <i>output</i>. Naam kuch enforce nahi karte. Line par bharosa karo, naam par nahi.</p>

<p><b>Clue 2: per-class counters.</b> Direction sahi hone ke baad agla sawal hai ki packets uski jagah kahan jaa rahe hain. class-default mein bade numbers jabki naam waali class mein kam ya kuch nahi, batata hai ki us class ne traffic pehchana nahi. Dhyan do kaun se flows prabhavit the. Agar phone class-default mein hai par web traffic classify ho raha hai, to fault voice class ka hai, poori policy ka nahi.</p>

<p><b>Clue 3: ACL range.</b> Jab class kisi ACL ko point karti hai, ACL ko <code>show ip access-lists NAME</code> se kholo aur application se milao. Voice media aam taur par RTP range <code>16384</code> se <code>32767</code> mein UDP use karta hai. Agar ACL us range ka chhota hissa permit karta hai, to kuch calls match hongi aur kuch nahi, jo sabse buri tarah ka fault hai kyunki ek jaldi test pass ho sakta hai. Apne device ke exact port se test karo, phir ACL ko line by line padho.</p>

<p><b>Clue 4: any ya all.</b> <code>show class-map</code> mein class-map header dekho. Do protocol lines wali class, jaise http aur secure-http, dono mein se kisi ek ko pakadne ke liye hai. Agar header <b>match-all</b> kehta hai, to packet ko dono lines ek saath satisfy karni padengi, aur ek TCP packet kabhi dono protocol nahi hota. Tab class kuch bhi match nahi karti jabki configuration mein bilkul theek dikhti hai. Pehle header ka shabd padho, phir lines.</p>

<h3>Check karne ka order matter karta hai</h3>
<p>ACL se shuru karne ka mann karta hai kyunki lagta hai galtiyan wahin hoti hain. Rok lo. Agar policy galat direction mein lagi hai, to perfect ACL bhi kuch nahi dikhata aur aap ek sahi object edit karte hue waqt barbaad karoge. Bahar se shuru karo: kya policy sahi interface par sahi direction mein hai; phir kaun si class packets le rahi hai; phir match ki detail. Yeh bhi yaad rakho ki ek se zyada fault saath ho sakte hain. Pehla theek karne ke baad test phir chalao aur counters phir padho. Aanshik recovery ek clue hai, jeet nahi.</p>
<table class="cmp"><tr><th>Symptom</th><th>Pehle kya check karo</th></tr>
<tr><td>Har class zero</td><td>Policy line mein direction aur attachment</td></tr>
<tr><td>Ek class khaali, baaki theek</td><td>Woh class: ACL contents, match type</td></tr>
<tr><td>Kuch calls ke liye chalta hai, kuch ke liye nahi</td><td>ACL ke andar port range ya address range</td></tr>
<tr><td>Yahan marking theek, door ke end par galat</td><td>Is ke baad ka device jo re-mark karta hai (trust boundary)</td></tr>
</table>

<h3>Repair ko prove karo</h3>
<p>Lab ka ant proof task se isliye hota hai. Apne badlav ke baad flows phir chalao, har class counter padho, dekho <code>Packets marked</code> sahi classes mein badhta hai, aur <code>traffic show</code> mein confirm karo ki phone flow 0.0 percent loss dikhata hai. Agar before aur after nahi dikha sakte, to aapke paas andaza hai, fix nahi.</p>

<div class="warn"><p><b>Common mistake.</b> Fault dhundhne ki jagah poori policy dobara likh dena. Nayi policy aam taur par wahi galat soch dohrati hai. Padho, locate karo, ek line badlo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do protocol lines ke saath match-all kuch match nahi karta. Policy ka naam bas ek label hai; direction service-policy command tay karti hai. First match wins, isliye shuru ki broad class baad ki class ke liye bana traffic nigal sakti hai.</p></div>

<div class="scn"><h4>Aadhi calls marked thi</h4><p>Jaipur ke ek contact centre ne complain ki ki kuch calls saaf thi aur kuch tootati thi. ACL sirf UDP ports 16384 to 17000 permit karta tha. Phone system poori RTP range ke ports use karta tha, isliye jo calls low port par aayi woh marked hui aur baaki class-default mein gayi. Engineer ne ACL line ko flow list ke port se milakar yeh pakda.</p><p><b>Lesson:</b> intermittent ka matlab aam taur par aisi range jo traffic ka sirf ek hissa cover karti hai.</p></div>
<div class="iv"><p class="q">"Traffic class-default mein jaa raha hai. Kya check karte ho?"</p><p>Counters se symptom confirm karo, phir dekho policy kahan aur kis direction mein lagi hai, phir kaun si class ko traffic pakadna chahiye tha, phir class type aur ACL ke contents. Ek samay mein ek cheez badlo aur fresh traffic aur far-end results se prove karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: reproduce, attachment check, class order check, match detail check, ek cheez badlo, prove.</li>
<li>Direction service-policy line se aati hai, policy ke naam se nahi.</li>
<li>ACL port ranges ko milao jo application sach mein use karti hai.</li>
<li>Match-all mein har line ek saath true chahiye; match-any mein ek.</li>
<li>Faults stack ho sakte hain: har fix ke baad counters phir padho.</li>
</ul></div>
`}};export{e as default};