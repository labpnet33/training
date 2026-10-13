var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module never having run a script. You now know why engineers automate, what Python and a script are, how a loop visits many routers, how to push and verify a change, and how to read a traceback. Use this page as your revision sheet.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Explain in one minute why a script beats typing on 50 routers.</li>
<li>Name the four steps of the automation ladder.</li>
<li>Run a script with <code>python3 FILE</code> and view it with <code>nl</code>.</li>
<li>Read a loop over a list of IPs and say what it does.</li>
<li>Add a router to a script by editing the list only.</li>
<li>Send config with <code>send_config_set</code> and save it with <code>save_config</code>.</li>
<li>Read a traceback from the last line up, and name the cause of a timeout.</li>
<li>Verify the result on a device with a show command or a read-only script.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Script</dt><dd>A text file of Python steps (.py).</dd>
<dt>Variable</dt><dd>A named box that holds a value.</dd>
<dt>String</dt><dd>Text inside quotes.</dd>
<dt>List</dt><dd>Several values in order, in square brackets.</dd>
<dt>Loop (for)</dt><dd>Repeats a block once per item.</dd>
<dt>Library / module</dt><dd>Ready-made code you import.</dd>
<dt>ConnectHandler</dt><dd>The tool that opens an SSH session to a device.</dd>
<dt>Traceback</dt><dd>Python's report of where and why a script stopped.</dd>
<dt>API</dt><dd>A door made for programs, returning structured data.</dd>
<dt>Idempotent</dt><dd>Safe to run again with the same end state.</dd>
</dl>
<h3>Command and code cheat-sheet</h3>
<table class="cmp"><thead><tr><th>You want to...</th><th>Use</th></tr></thead><tbody>
<tr><td>See files</td><td><code>ls</code></td></tr>
<tr><td>Read a file with line numbers</td><td><code>nl FILE</code></td></tr>
<tr><td>Run a script</td><td><code>python3 FILE.py</code></td></tr>
<tr><td>Open an SSH session</td><td><code>ConnectHandler(device_type=..., host=..., username=..., password=...)</code></td></tr>
<tr><td>Run a show command</td><td><code>conn.send_command("show ...")</code></td></tr>
<tr><td>Send config lines</td><td><code>conn.send_config_set([...])</code></td></tr>
<tr><td>Save config</td><td><code>conn.save_config()</code></td></tr>
<tr><td>Log out</td><td><code>conn.disconnect()</code></td></tr>
</tbody></table>
<h3>Most tested facts</h3>
<ul>
<li>A comment starts with <code>#</code>; indentation (4 spaces) and a colon mark a block.</li>
<li>Lists start at index 0; <code>range(1, 4)</code> gives 1, 2, 3.</li>
<li><code>send_command</code> is for show output; <code>send_config_set</code> is for configuration.</li>
<li>A timeout exception means no TCP connection; an authentication exception means a login problem.</li>
<li>A script that stops halfway leaves earlier devices changed; always verify.</li>
<li>An API returns structured data; a CLI script parses screen text.</li>
</ul>
<p><b>Next:</b> the module "Python 1" teaches print, variables, strings and f-strings properly, starting from zero. Then "Python 2" covers lists, dictionaries, loops and decisions in depth.</p>
<div class="scn"><h4>From fear to first script</h4><p>A support engineer with CCNA-level knowledge avoided scripts for two years. After running read-only scripts in a lab, she moved to a real inventory check: a 12-line script that listed each router's hostname. It saved her team an hour every Monday, and she added a config step six weeks later.</p><p><b>Lesson:</b> start small and read-only; confidence follows.</p></div>
<div class="iv"><p class="q">"Describe a first network automation project you would suggest to a team."</p><p>A read-only inventory or compliance check: loop over a device list, log in, run a show command, compare with an expected value, and print OK or DIFFERENT per device. It is low risk, produces evidence, and builds the skills (loops, parsing, error handling) needed for later config changes.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation = a script plus a list plus a loop, with verification.</li>
<li>Read the last line of a traceback first.</li>
<li>Start read-only, test on one device, verify on the device.</li>
<li>Next up: Python 1, then Python 2.</li>
</ul></div>
`,hi:`
<p>Aapne is module ko shuru kiya jab tak aapne koi script nahi chalayi thi. Ab aap jaante ho ki engineers automate kyun karte hain, Python aur script kya hain, loop kaise kai routers visit karta hai, change kaise push aur verify karte hain, aur traceback kaise padhte hain. Is page ko apni revision sheet banao.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Ek minute mein samjha sako ki 50 routers par type karne se script kyun behtar hai.</li>
<li>Automation ki seedhi ke chaar steps bata sako.</li>
<li><code>python3 FILE</code> se script chala sako aur <code>nl</code> se dekh sako.</li>
<li>IPs ki list par loop padh kar bata sako ki woh kya karta hai.</li>
<li>Sirf list edit karke script mein router jod sako.</li>
<li><code>send_config_set</code> se config bhej sako aur <code>save_config</code> se save kar sako.</li>
<li>Traceback aakhri line se upar padh sako, aur timeout ki wajah bata sako.</li>
<li>Show command ya read-only script se device par result verify kar sako.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Script</dt><dd>Python steps ki text file (.py).</dd>
<dt>Variable</dt><dd>Naam wala dabba jo value rakhta hai.</dd>
<dt>String</dt><dd>Quotes ke andar ka text.</dd>
<dt>List</dt><dd>Square brackets mein order mein kai values.</dd>
<dt>Loop (for)</dt><dd>Block ko har item ke liye ek baar repeat karta hai.</dd>
<dt>Library / module</dt><dd>Ready-made code jo aap import karte ho.</dd>
<dt>ConnectHandler</dt><dd>Tool jo device ka SSH session kholta hai.</dd>
<dt>Traceback</dt><dd>Python ki report ki script kahan aur kyun ruka.</dd>
<dt>API</dt><dd>Programs ke liye bana darwaza, structured data deta hai.</dd>
<dt>Idempotent</dt><dd>Dobara chalana safe, end state wahi.</dd>
</dl>
<h3>Command aur code cheat-sheet</h3>
<table class="cmp"><thead><tr><th>Aap chahte ho...</th><th>Use karo</th></tr></thead><tbody>
<tr><td>Files dekhna</td><td><code>ls</code></td></tr>
<tr><td>File line numbers ke saath padhna</td><td><code>nl FILE</code></td></tr>
<tr><td>Script chalana</td><td><code>python3 FILE.py</code></td></tr>
<tr><td>SSH session kholna</td><td><code>ConnectHandler(device_type=..., host=..., username=..., password=...)</code></td></tr>
<tr><td>Show command chalana</td><td><code>conn.send_command("show ...")</code></td></tr>
<tr><td>Config lines bhejna</td><td><code>conn.send_config_set([...])</code></td></tr>
<tr><td>Config save karna</td><td><code>conn.save_config()</code></td></tr>
<tr><td>Logout</td><td><code>conn.disconnect()</code></td></tr>
</tbody></table>
<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Comment <code>#</code> se shuru hota hai; indentation (4 spaces) aur colon block batate hain.</li>
<li>Lists index 0 se shuru hoti hain; <code>range(1, 4)</code> 1, 2, 3 deta hai.</li>
<li><code>send_command</code> show output ke liye; <code>send_config_set</code> configuration ke liye.</li>
<li>Timeout exception matlab TCP connection nahi; authentication exception matlab login problem.</li>
<li>Beech mein ruka script pehle ke devices badle chhodta hai; hamesha verify karo.</li>
<li>API structured data deta hai; CLI script screen text parse karta hai.</li>
</ul>
<p><b>Aage:</b> module "Python 1" print, variables, strings aur f-strings ko zero se theek se sikhata hai. Phir "Python 2" lists, dictionaries, loops aur decisions ko gehraai se cover karta hai.</p>
<div class="scn"><h4>Dar se pehli script tak</h4><p>CCNA-level knowledge wali ek support engineer do saal scripts se door rahi. Lab mein read-only scripts chalane ke baad woh asli inventory check par gayi: 12 lines ka script jo har router ka hostname list karta tha. Isse team ka har Monday ek ghanta bacha, aur usne chhe hafte baad config step jod diya.</p><p><b>Lesson:</b> chhote aur read-only se shuru karo; confidence apne aap aata hai.</p></div>
<div class="iv"><p class="q">"Team ko aap pehla network automation project kaunsa suggest karoge?"</p><p>Read-only inventory ya compliance check: device list par loop, login, show command, expected value se compare, aur har device ke liye OK ya DIFFERENT print. Yeh low risk hai, saboot deta hai, aur baad ke config changes ke liye zaroori skills (loops, parsing, error handling) banata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation = script, list, loop, aur verification.</li>
<li>Traceback ki aakhri line pehle padho.</li>
<li>Read-only se shuru, ek device par test, device par verify.</li>
<li>Aage: Python 1, phir Python 2.</li>
</ul></div>
`}};export{e as default};