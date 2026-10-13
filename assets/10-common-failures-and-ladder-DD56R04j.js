var e={id:`common-failures-and-ladder`,h:{en:`Common failures and a troubleshooting ladder`,hi:`Common failures aur troubleshooting ladder`},body:{en:`
<p>A doctor does not start with surgery. She asks where it hurts, takes the temperature, checks the simple causes, and only then orders bigger tests. Template troubleshooting deserves the same ladder: start with the cheapest question and climb only when it is answered.</p>

<h3>Four families of failure</h3>
<table class="tbl"><thead><tr><th>Family</th><th>What you see</th><th>Typical cause</th></tr></thead><tbody>
<tr><td>Unresolved variable</td><td>commit failed: variable $x has no value for this firewall</td><td>New firewall or new variable without values</td></tr>
<tr><td>Wrong type</td><td>Commit to Panorama is rejected</td><td>Value does not match the variable type</td></tr>
<tr><td>Order mistake</td><td>Push succeeds, value is not the one you expected</td><td>Wrong template position in the stack</td></tr>
<tr><td>Override drift</td><td>Push succeeds, firewall differs from template</td><td>Local value typed on the box</td></tr>
</tbody></table>
<p>There are also family members from other modules that look similar: a device group push fails with an invalid zone reference when the template was never pushed, and a firewall that is not connected cannot receive anything. Both belong to the push-order and connection modules, but you should rule them out in a template ticket too.</p>

<h3>The ladder</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Template troubleshooting ladder">
<rect x="30" y="10" width="580" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1 Is the firewall connected? (show devices all)</text>
<rect x="30" y="56" width="580" height="38" rx="8" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2 Was the change committed on Panorama? (push sends committed config)</text>
<rect x="30" y="102" width="580" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">3 Read the per-firewall push result line (variable, type, reference)</text>
<rect x="30" y="148" width="580" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">4 Check stack order and the resulting value (show template-stack)</text>
<rect x="30" y="194" width="580" height="38" rx="8" fill="#fde68a"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">5 Compare pushed-template with running on the firewall</text>
<rect x="30" y="240" width="580" height="38" rx="8" fill="#fed7aa"/><text x="320" y="264" text-anchor="middle" class="svg-ink" font-size="13">6 Fix with the smallest change, validate-only, push to one device, verify</text>
</svg><p class="cap">Climb from the top. Stop at the first rung that explains the symptom.</p></div>

<h3>Applying the ladder</h3>
<p><b>Rungs 1 and 2</b> are cheap. <code>show devices all</code> tells you Connected and the Template state; the committed rule is easy to forget under pressure. <b>Rung 3</b> is where most tickets end, because the lab's error text already names the variable and tells you where to set it. <b>Rung 4</b> is about order: read the stack list with the highest priority first. <b>Rung 5</b> finds overrides. <b>Rung 6</b> says how to repair safely.</p>
<pre class="code">PANO&gt; show devices all
PANO&gt; commit-all template-stack name NK-STACK validate-only yes
NK-PUNE-PA&gt; show config pushed-template
NK-PUNE-PA&gt; show config running
NK-PUNE-PA&gt; show jobs all</pre>

<h3>Habits that make the ladder fast</h3>
<ul>
<li>Write the exact variable name from the error in the ticket, not a paraphrase.</li>
<li>One change at a time; a second change hides which one worked.</li>
<li>After the fix, re-run the same check that failed.</li>
<li>Record the cause in a family (variable, type, order, override) so patterns appear over months.</li>
</ul>

<div class="scn"><h4>Thirty firewalls, three failures</h4><p>A stack push to thirty firewalls ended with three errors. Instead of retrying blindly, the engineer read the three lines: two named a missing variable on firewalls just added, one named a wrong type where someone had typed an address without a mask. Three small value fixes, one validate-only run, and one final push left all thirty in sync. The whole incident took twenty minutes because the error lines were read, not guessed at.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting a template push that failed on one firewall."</p><p>Check that it is connected and that the change is committed. Read that firewall's result line; it usually names the variable, type or reference. Check stack order if the value is unexpected, compare pushed-template with running for overrides, fix with the smallest change, run validate-only, push to that device, and verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four families: unresolved variable, wrong type, order mistake, override drift.</li>
<li>Climb the ladder from cheap questions: connection, commit, result line, order, overrides.</li>
<li>Read the per-firewall error text; it names the variable and where to fix it.</li>
<li>Fix one thing, validate, push to one device, verify.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Wo puchti hai kahan dard hai, temperature leti hai, simple causes check karti hai, aur tab bade tests likhti hai. Template troubleshooting ko bhi wahi ladder chahiye: sabse sasta sawal pehle, aur uska jawab milne par hi upar chadho.</p>

<h3>Failure ke chaar families</h3>
<table class="tbl"><thead><tr><th>Family</th><th>Kya dikhta hai</th><th>Typical cause</th></tr></thead><tbody>
<tr><td>Unresolved variable</td><td>commit failed: variable $x has no value for this firewall</td><td>Naya firewall ya naya variable bina values ke</td></tr>
<tr><td>Wrong type</td><td>Panorama par commit reject hota hai</td><td>Value variable type se match nahi karti</td></tr>
<tr><td>Order mistake</td><td>Push succeed, value wo nahi jo socha tha</td><td>Stack mein template ki galat position</td></tr>
<tr><td>Override drift</td><td>Push succeed, firewall template se alag</td><td>Box par local value type ki gayi</td></tr>
</tbody></table>
<p>Doosre modules ke bhi family members hain jo similar dikhte hain: template kabhi push na hua ho to device group push invalid zone reference se fail hota hai, aur connected na hone wala firewall kuch receive nahi kar sakta. Dono push-order aur connection modules ke hain, par template ticket mein inhe bhi rule out karna chahiye.</p>

<h3>Ladder</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Template troubleshooting ladder">
<rect x="30" y="10" width="580" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1 Firewall connected hai? (show devices all)</text>
<rect x="30" y="56" width="580" height="38" rx="8" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2 Change Panorama par commit hua? (push committed config bhejta hai)</text>
<rect x="30" y="102" width="580" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">3 Per-firewall push result line padho (variable, type, reference)</text>
<rect x="30" y="148" width="580" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">4 Stack order aur resulting value (show template-stack)</text>
<rect x="30" y="194" width="580" height="38" rx="8" fill="#fde68a"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">5 Firewall par pushed-template ko running se compare karo</text>
<rect x="30" y="240" width="580" height="38" rx="8" fill="#fed7aa"/><text x="320" y="264" text-anchor="middle" class="svg-ink" font-size="13">6 Smallest change, validate-only, ek device ko push, verify</text>
</svg><p class="cap">Upar se chadho. Jo pehla rung symptom samjhaye wahin ruk jao.</p></div>

<h3>Ladder lagana</h3>
<p><b>Rungs 1 aur 2</b> sasti hain. <code>show devices all</code> Connected aur Template state batata hai; pressure mein committed wala rule bhoolna aasaan hai. <b>Rung 3</b> par zyada tar tickets khatam hote hain, kyunki lab ka error text variable ka naam batata hai aur kahan set karna hai ye bhi. <b>Rung 4</b> order ke baare mein hai: stack list highest priority pehle padho. <b>Rung 5</b> overrides dhoondhti hai. <b>Rung 6</b> safe repair ka tareeka batati hai.</p>
<pre class="code">PANO&gt; show devices all
PANO&gt; commit-all template-stack name NK-STACK validate-only yes
NK-PUNE-PA&gt; show config pushed-template
NK-PUNE-PA&gt; show config running
NK-PUNE-PA&gt; show jobs all</pre>

<h3>Aadatein jo ladder ko tez banati hain</h3>
<ul>
<li>Error ka exact variable name ticket mein likho, paraphrase nahi.</li>
<li>Ek time par ek change; doosra change chhupa deta hai ki kaunsa kaam aaya.</li>
<li>Fix ke baad wahi check dobara chalao jo fail hua tha.</li>
<li>Cause ko family mein record karo (variable, type, order, override) taaki mahino mein patterns dikhein.</li>
</ul>

<div class="scn"><h4>Tees firewalls, teen failures</h4><p>Tees firewalls ke stack push mein teen errors aaye. Andhadhund retry karne ke bajay engineer ne teen lines padhin: do ne abhi jode firewalls par missing variable bataya, ek ne wrong type bataya jahan kisi ne mask ke bina address type kiya tha. Teen chhote value fixes, ek validate-only run, aur ek aakhri push se tees ke tees in sync ho gaye. Poora incident bees minute mein nipta kyunki error lines padhi gayi, andaza nahi lagaya gaya.</p></div>

<div class="iv"><p class="q">"Ek firewall par fail hue template push ko troubleshoot karna samjhao."</p><p>Check karo ki connected hai aur change committed hai. Us firewall ki result line padho; wo aksar variable, type ya reference ka naam batati hai. Value unexpected ho to stack order check karo, overrides ke liye pushed-template ko running se compare karo, smallest change se fix karo, validate-only chalao, usi device ko push karo, aur verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar families: unresolved variable, wrong type, order mistake, override drift.</li>
<li>Sasto sawalon se ladder chadho: connection, commit, result line, order, overrides.</li>
<li>Per-firewall error text padho; wo variable aur fix ki jagah batata hai.</li>
<li>Ek cheez fix karo, validate, ek device ko push, verify.</li>
</ul></div>
`}};export{e as default};