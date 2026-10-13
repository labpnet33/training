var e={id:`troubleshooting-ladder`,h:{en:`The troubleshooting ladder: rule, profile, connection, collector, filter`,hi:`Troubleshooting ladder: rule, profile, connection, collector, filter`},body:{en:`
<p>A doctor does not start with surgery. She asks the same questions in the same order: temperature, pulse, then deeper tests. Missing logs need the same discipline. If you jump around, you will fix the wrong thing and the logs will still not arrive. Use a ladder and take one rung at a time, from the closest to the source to the furthest.</p>

<h3>The ladder</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Is the log written? Rule action matched, log-end not no (created counter)</text>
<rect x="20" y="54" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">2. Does the rule name a profile, pushed to this firewall?</text>
<rect x="20" y="98" width="600" height="38" rx="6" fill="#fed7aa"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">3. Does a match list select it and send-to-panorama yes? (filter)</text>
<rect x="20" y="142" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">4. Is the firewall connected to the active Panorama?</text>
<rect x="20" y="186" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">5. Does its collector group have a connected collector?</text>
</svg><p class="cap">Climb in this order. Each rung rules out one stage of the log's path.</p></div>

<h3>One command to choose the rung</h3>
<p>Generate real traffic from a PC, then read the firewall counters:</p>
<table class="tbl"><tr><th>What you see</th><th>Meaning</th><th>Go to rung</th></tr>
<tr><td>created 0</td><td>No log was written</td><td>1: rule, matching, log-end</td></tr>
<tr><td>created grows, forwarded 0, waiting 0</td><td>Not selected for forwarding</td><td>2 and 3: profile on rule, match list, filter, send-to-panorama</td></tr>
<tr><td>waiting grows</td><td>Selected, but path not ready</td><td>4 and 5: connection, collector group</td></tr>
<tr><td>forwarded grows, Panorama shows nothing</td><td>Look at the destination view or the search</td><td>Panorama device view, filters in your search</td></tr>
</table>
<p>Remember that silent checks create no log. Run a real session, such as a web request or a telnet to a port, before you read the counters. A traffic log also needs the session to match a rule that exists on the firewall; if policy was never pushed, nothing logs at all, which is rung 2 in disguise.</p>

<h3>What to check on each rung</h3>
<ol>
<li><b>Rule:</b> on the firewall confirm which rule the test traffic hit and whether it logs. Confirm the rule on Panorama has no <code>log-end no</code>.</li>
<li><b>Profile on the rule:</b> confirm the rule line carries <code>log-setting</code> with the exact profile name, then that you committed and pushed the device group. A pre-commit edit never reaches a firewall.</li>
<li><b>Match list:</b> read the profile on Panorama. Check log type, the filter text and <code>send-to-panorama</code>.</li>
<li><b>Connection:</b> on the firewall, read the Panorama server line in the status output. If it is not connected, return to the management-connection checks from the first module.</li>
<li><b>Collector:</b> on Panorama, read the collector group and collector status. If you created a custom group, confirm that you pushed the collector configuration.</li>
</ol>

<h3>Change one thing, then test again</h3>
<p>The most common beginner error is to change three settings at once and not know which one fixed the problem. After every fix: commit, push the right scope, run fresh traffic, and read the counters again. A lab can have more than one cause. In the second lab, two separate faults hide behind the same symptom: you fix one, the logs are still missing, and you continue to the next rung.</p>

<div class="warn"><p><b>Common mistakes.</b> Testing before pushing; reading old counters without new traffic; blaming Panorama when the rule never logged; searching Panorama with a filter that hides the very logs you want.</p></div>

<div class="scn"><h4>Two faults, one symptom</h4><p>After a rollout, Panorama showed no logs from two branches. The first engineer corrected the profile and saw no change, and gave up. The next engineer climbed the ladder: the profile was now right, but the rule had its end log turned off. Once both were fixed and pushed, logs arrived within a minute.</p><p><b>Lesson:</b> a fix that shows no change is not proof the fix was wrong. There may be a second cause on another rung.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting missing logs on Panorama."</p><p>I generate real traffic, read created, forwarded and waiting on the firewall, and then climb: is the log written, does the rule name a pushed profile, does a match list select it with send-to-panorama, is the firewall connected to the active Panorama, and does its collector group have a collector. I change one thing, commit and push, and retest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder: rule, profile on rule, match list and filter, connection, collector.</li>
<li>The three counters choose the rung.</li>
<li>Generate real traffic; silent checks create no logs.</li>
<li>Change one thing, push, retest; remember there can be two faults.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Wo wahi sawal wahi order mein poochhti hai: temperature, pulse, phir gehre tests. Missing logs ke liye bhi wahi discipline chahiye. Idhar-udhar kudoge to galat cheez fix karoge aur logs phir bhi nahi aayenge. Ladder use karo aur ek time par ek rung lo, source ke sabse paas se sabse door tak.</p>

<h3>Ladder</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Kya log likha gaya? Rule action match hua, log-end no nahi (created counter)</text>
<rect x="20" y="54" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">2. Kya rule profile ka naam leta hai, is firewall par pushed?</text>
<rect x="20" y="98" width="600" height="38" rx="6" fill="#fed7aa"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">3. Kya match list select karti hai aur send-to-panorama yes? (filter)</text>
<rect x="20" y="142" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">4. Kya firewall active Panorama se connected hai?</text>
<rect x="20" y="186" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">5. Kya uske collector group mein connected collector hai?</text>
</svg><p class="cap">Isi order mein chadho. Har rung log ke path ka ek stage rule out karta hai.</p></div>

<h3>Rung chunne ke liye ek command</h3>
<p>PC se real traffic generate karo, phir firewall counters padho:</p>
<table class="tbl"><tr><th>Aap kya dekhte ho</th><th>Matlab</th><th>Rung par jao</th></tr>
<tr><td>created 0</td><td>Koi log likha hi nahi</td><td>1: rule, matching, log-end</td></tr>
<tr><td>created badh raha, forwarded 0, waiting 0</td><td>Forwarding ke liye select nahi hua</td><td>2 aur 3: rule par profile, match list, filter, send-to-panorama</td></tr>
<tr><td>waiting badh raha</td><td>Select hua, lekin path ready nahi</td><td>4 aur 5: connection, collector group</td></tr>
<tr><td>forwarded badh raha, Panorama par kuch nahi</td><td>Destination view ya search dekho</td><td>Panorama device view, aapki search ke filters</td></tr>
</table>
<p>Yaad rakho silent checks log nahi banate. Counters padhne se pehle real session chalao, jaise web request ya kisi port par telnet. Traffic log ke liye session ko firewall par exist karne wale rule se match karna bhi chahiye; policy kabhi push nahi hui to kuch log hota hi nahi, jo bhes badal kar rung 2 hai.</p>

<h3>Har rung par kya check karna hai</h3>
<ol>
<li><b>Rule:</b> firewall par confirm karo test traffic kis rule se hit hua aur wo log karta hai ya nahi. Panorama par confirm karo rule mein <code>log-end no</code> nahi hai.</li>
<li><b>Rule par profile:</b> confirm karo rule line mein sahi profile naam ke saath <code>log-setting</code> hai, phir ye ki device group commit aur push kiya. Commit se pehle ka edit firewall tak kabhi nahi pahunchta.</li>
<li><b>Match list:</b> Panorama par profile padho. Log type, filter text aur <code>send-to-panorama</code> dekho.</li>
<li><b>Connection:</b> firewall par status output mein Panorama server line padho. Connected nahi hai to pehle module ke management-connection checks par wapas jao.</li>
<li><b>Collector:</b> Panorama par collector group aur collector status padho. Custom group banaya ho to confirm karo collector configuration push ki.</li>
</ol>

<h3>Ek cheez badlo, phir dobara test karo</h3>
<p>Beginner ki sabse common galti teen settings ek saath badalna hai aur ye na jaanna ki kisne problem fix ki. Har fix ke baad: commit, sahi scope push, fresh traffic chalao, aur counters phir padho. Lab mein ek se zyada cause ho sakte hain. Doosre lab mein do alag faults ek hi symptom ke peeche chhupe hain: ek fix karte ho, logs phir bhi missing, aur agle rung par jaate ho.</p>

<div class="warn"><p><b>Common mistakes.</b> Push se pehle test karna; naye traffic ke bina purane counters padhna; rule ne kabhi log nahi kiya aur Panorama ko doshi thehrana; Panorama mein aisa filter lagana jo wahi logs chhupa de jo aapko chahiye.</p></div>

<div class="scn"><h4>Do faults, ek symptom</h4><p>Rollout ke baad Panorama par do branches ke logs nahi dikhe. Pehle engineer ne profile sahi kiya, koi change nahi dikha, aur chhod diya. Agle engineer ne ladder chadhi: profile ab sahi tha, lekin rule ka end log off tha. Dono fix aur push hone ke baad logs ek minute mein aa gaye.</p><p><b>Lesson:</b> jis fix se change nahi dikha wo galat tha ye proof nahi hai. Doosre rung par doosra cause ho sakta hai.</p></div>

<div class="iv"><p class="q">"Panorama par missing logs ka troubleshooting mujhe step by step batao."</p><p>Real traffic generate karta hoon, firewall par created, forwarded aur waiting padhta hoon, phir chadhta hoon: kya log likha gaya, kya rule pushed profile ka naam leta hai, kya match list send-to-panorama ke saath select karti hai, kya firewall active Panorama se connected hai, aur kya uske collector group mein collector hai. Ek cheez badalta hoon, commit aur push karta hoon, aur retest karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder: rule, rule par profile, match list aur filter, connection, collector.</li>
<li>Teen counters rung chunte hain.</li>
<li>Real traffic generate karo; silent checks logs nahi banate.</li>
<li>Ek cheez badlo, push karo, retest karo; yaad rakho do faults ho sakte hain.</li>
</ul></div>
`}};export{e as default};