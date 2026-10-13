var e={id:`template-change-management`,h:{en:`Change management for templates`,hi:`Templates ke liye change management`},body:{en:`
<p>A city water department that wants to change the pressure does not open the valve for the whole city at once. It tries one neighbourhood, watches the taps, and then widens the change. A template is a valve for many firewalls at the same time, so the same care applies. The power that makes templates efficient also makes a mistake travel fast. Change management is how you keep that power safe.</p>

<h3>Blast radius</h3>
<p>The <b>blast radius</b> is the number of firewalls a change can affect. A change in a global template touches every stack that includes it. A change in a one-site template touches one box. Before any edit ask: which stacks use this template, and which firewalls are in those stacks? If the answer is "everything", the change needs a stronger process than if the answer is "two test firewalls".</p>
<table class="tbl"><thead><tr><th>Change</th><th>Blast radius</th><th>Process</th></tr></thead><tbody>
<tr><td>Variable value for one firewall</td><td>One box</td><td>Validate, push to device</td></tr>
<tr><td>Region template (for example MTU)</td><td>One region</td><td>Test stack first, then region</td></tr>
<tr><td>Global template (for example DNS, Panorama server)</td><td>All firewalls</td><td>Review, test stack, staged push, rollback plan</td></tr>
</tbody></table>

<h3>A test stack</h3>
<p>Keep a small stack with one or two non-critical firewalls that use the same templates as production. New edits go to the test stack first. In the lab you can model this with a second stack that lists the same templates. Keep in mind that a firewall normally belongs to one stack at a time (check the documentation for your PAN-OS version), so move the test firewall deliberately and write down where it normally lives.</p>

<h3>The safe sequence</h3>
<ol>
<li><b>Plan:</b> write what changes, which stacks and firewalls, and the way back.</li>
<li><b>Edit</b> in the candidate configuration; read the change.</li>
<li><b>Commit</b> to Panorama; this changes only Panorama.</li>
<li><b>Validate:</b> <code>validate-only yes</code> against the intended scope, and read each firewall's line.</li>
<li><b>Push small:</b> one device, then a group, then everyone.</li>
<li><b>Verify:</b> sync state, pushed-template, running, interface state, a real traffic test.</li>
<li><b>Record:</b> the ticket, the time, the result and the rollback if used.</li>
</ol>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK validate-only yes
PANO&gt; commit-all template-stack name NK-STACK device &lt;serial of the test firewall&gt;
NK-PUNE-PA&gt; show config pushed-template
PANO&gt; commit-all template-stack name NK-STACK</pre>

<h3>Rollback thinking</h3>
<p>A push sends the committed configuration, so the way back is to restore the earlier values on Panorama, commit and push again. That is why you save what the old values were before editing. Some changes (a wrong management address, a broken default route) can cut the firewall off from Panorama, so no push can reach it; for those, you need out-of-band access, which is why the lab management network is out of band. Check the documentation for your PAN-OS version for the configuration versioning and revert tools that your platform offers.</p>

<h3>merge-with-candidate-cfg, a quiet surprise</h3>
<p>If a firewall has pending local changes that were never committed, a push with <code>merge-with-candidate-cfg yes</code> commits them together with the template. That is rarely what you want. In the lab the default is no, which leaves those local changes pending. State the option explicitly so you never depend on a default.</p>

<div class="scn"><h4>The global change that went to one box first</h4><p>The team had to move all firewalls to a new DNS server. They edited the global template, validated, pushed to one non-critical firewall, and checked name resolution from a PC behind it. Only then did they push to the rest in two groups, outside business hours. One firewall had a local DNS value that the template could not change; because they verified each group, they found it the same night instead of a month later.</p></div>

<div class="iv"><p class="q">"How do you roll out a template change that affects every firewall?"</p><p>I assess the blast radius, edit and commit, run validate-only, push to a single test device and verify with a real test, then push in stages with checks after each stage. I record old values for rollback and keep out-of-band access ready for changes that could break the management path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Blast radius equals the firewalls reached by the stacks that use the template.</li>
<li>Test stack, validate-only and push-to-one-device keep mistakes small.</li>
<li>Rollback means restoring old values, commit and push; save them first.</li>
<li>State merge-with-candidate-cfg and other options explicitly; do not rely on defaults.</li>
</ul></div>
`,hi:`
<p>Shahar ka water department pressure badalna chahe to poore shahar ka valve ek saath nahi kholta. Wo ek mohalla try karta hai, nalon ko dekhta hai, phir change phailata hai. Template bahut firewalls ke liye ek saath valve hai, isliye wahi savdhani chahiye. Jo power templates ko efficient banati hai wahi galti ko tezi se dauda deti hai. Change management us power ko safe rakhne ka tareeka hai.</p>

<h3>Blast radius</h3>
<p><b>Blast radius</b> un firewalls ki ginti hai jinhe change affect kar sakta hai. Global template mein change har us stack ko chhoota hai jisme wo shamil hai. Ek-site template mein change ek box ko. Edit se pehle puchho: ye template kaunse stacks use karte hain, aur un stacks mein kaunse firewalls hain? Jawab "sab" ho to change ko "do test firewalls" se zyada strong process chahiye.</p>
<table class="tbl"><thead><tr><th>Change</th><th>Blast radius</th><th>Process</th></tr></thead><tbody>
<tr><td>Ek firewall ki variable value</td><td>Ek box</td><td>Validate, device ko push</td></tr>
<tr><td>Region template (jaise MTU)</td><td>Ek region</td><td>Pehle test stack, phir region</td></tr>
<tr><td>Global template (jaise DNS, Panorama server)</td><td>Saare firewalls</td><td>Review, test stack, staged push, rollback plan</td></tr>
</tbody></table>

<h3>Test stack</h3>
<p>Ek chhota stack rakho jisme ek-do non-critical firewalls hon jo production jaise hi templates use karte hon. Naye edits pehle test stack par jaate hain. Lab mein ise doosre stack se model kar sakte ho jo wahi templates list kare. Real Panorama mein firewall ek time par ek stack ka hota hai (apne PAN-OS version ki documentation check karo), isliye test firewall ko soch-samajhkar hilao aur likh lo ki wo normally kahan rehta hai.</p>

<h3>Safe sequence</h3>
<ol>
<li><b>Plan:</b> likho kya badlega, kaunse stacks aur firewalls, aur wapas ka raasta.</li>
<li>Candidate configuration mein <b>edit</b> karo; change padho.</li>
<li>Panorama par <b>commit</b>; ye sirf Panorama ko badalta hai.</li>
<li><b>Validate:</b> intended scope par <code>validate-only yes</code>, aur har firewall ki line padho.</li>
<li><b>Chhota push:</b> ek device, phir ek group, phir sab.</li>
<li><b>Verify:</b> sync state, pushed-template, running, interface state, real traffic test.</li>
<li><b>Record:</b> ticket, time, result aur rollback agar use hua.</li>
</ol>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK validate-only yes
PANO&gt; commit-all template-stack name NK-STACK device &lt;serial of the test firewall&gt;
NK-PUNE-PA&gt; show config pushed-template
PANO&gt; commit-all template-stack name NK-STACK</pre>

<h3>Rollback ki soch</h3>
<p>Push committed configuration bhejta hai, isliye wapas jaane ka raasta hai Panorama par purani values restore karo, commit karo aur dobara push karo. Isiliye edit se pehle purani values save karte ho. Kuch changes (galat management address, toota default route) firewall ko Panorama se kaat sakte hain, to koi push us tak nahi pahunch sakta; unke liye out-of-band access chahiye, isiliye lab ka management network out of band hai. Tumhara platform kaunse configuration versioning aur revert tools deta hai ye apne PAN-OS version ki documentation mein check karo.</p>

<h3>merge-with-candidate-cfg, chupa hua surprise</h3>
<p>Agar firewall par pending local changes hain jo kabhi commit nahi hue, to <code>merge-with-candidate-cfg yes</code> ke saath push unhe template ke saath commit kar deta hai. Ye kam hi chahiye hota hai. Lab mein default no hai, jo un local changes ko pending rakhta hai. Option explicitly likho taaki default par depend na ho.</p>

<div class="scn"><h4>Global change jo pehle ek box par gaya</h4><p>Team ko saare firewalls ko naye DNS server par le jaana tha. Unhone global template edit kiya, validate kiya, ek non-critical firewall ko push kiya, aur uske peeche ke PC se name resolution check kiya. Tab jaake baaki ko do groups mein, business hours ke baad, push kiya. Ek firewall par local DNS value thi jo template badal nahi sakta tha; har group verify karne se wo usi raat mili, mahine baad nahi.</p></div>

<div class="iv"><p class="q">"Har firewall ko affect karne wala template change kaise roll out karoge?"</p><p>Blast radius assess karta hoon, edit aur commit, validate-only chalata hoon, ek test device ko push karke real test se verify karta hoon, phir stages mein push karta hoon aur har stage ke baad checks. Rollback ke liye purani values record karta hoon aur management path tod sakne wale changes ke liye out-of-band access taiyaar rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Blast radius = template use karne wale stacks se pahunche firewalls.</li>
<li>Test stack, validate-only aur ek device ko push galtiyan chhoti rakhte hain.</li>
<li>Rollback matlab purani values restore, commit aur push; pehle save karo.</li>
<li>merge-with-candidate-cfg aur doosre options explicitly likho; defaults par nahi.</li>
</ul></div>
`}};export{e as default};