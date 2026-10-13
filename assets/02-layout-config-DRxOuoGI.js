var e={id:`layout-config`,h:{en:`Layout, configuration, secrets and logging`,hi:`Layout, configuration, secrets aur logging`},body:{en:`
<p>A toolkit is not a folder of scripts. It has a <b>shape</b> that tells the next engineer where each decision lives, and a <b>frame</b> (settings, secrets, logs, exit codes) that makes it safe to run unattended. In <code>py-capstone</code> you built this shape for one vendor: a package, one entry point, one job per module. The multivendor toolkit keeps the same idea and grows it by two modules (the intent and the gate).</p>

<h3>The layout</h3>
<pre class="code">mvtoolkit/                     the project folder (a git repository)
  .env                         NETBOX_URL, NETBOX_TOKEN, DEVICE_USER, DEVICE_PASSWORD - never committed
  mvtool.py                    the front end: one command per stage
  mvtoolkit/                   the package: one job per module
    settings.py                the only file that reads the environment
    inventory.py               Nornir inventory built from NetBox
    intent.py                  NetBox to intent JSON, checked against the schema
    render.py                  intent to candidate configs with Jinja2
    gate.py                    schema, Batfish and address-plan checks
    safety.py                  the decisions of a change (pure Python)
    change.py                  the Nornir task: candidate, diff, commit, read back
    verify.py                  read every device back and compare with the intent
  schema/intent.schema.json    the contract of an intent document
  templates/ios.j2 junos.j2    one template per platform
  tests/test_safety.py         tests that need no router
  intent/ build/ reports/ logs/    generated, safe to delete (except logs)</pre>
<p>Two rules decide this layout. <b>Generated things never mix with source things</b>: <code>intent/</code>, <code>build/</code> and <code>reports/</code> can be deleted and rebuilt from NetBox, so nobody hand-edits them. <b>The front end contains no logic</b>: <code>mvtool.py</code> maps a word on the command line to a function and turns its return value into an exit code.</p>
<pre class="code">ACTIONS = {"inventory": cmd_inventory, "intent": cmd_intent, "render": cmd_render, "gate": cmd_gate,
           "plan": cmd_plan, "apply": cmd_apply, "verify": cmd_verify}

def main():
    ap = argparse.ArgumentParser(description="The multivendor toolkit.")
    ap.add_argument("action", choices=sorted(ACTIONS))
    args = ap.parse_args()
<span class="hl">    code = ACTIONS[args.action](args)</span>
    logging.info("action=%s exit=%d", args.action, code)
    return code</pre>
<p>Each <code>cmd_*</code> function imports what it needs inside the function. That keeps <code>python3 mvtool.py --help</code> fast and lets you build the toolkit one stage at a time, which is exactly how Lab 1 goes.</p>

<h3>Configuration: three kinds, three homes</h3>
<p>Not everything that changes belongs in the same place. <b>Secrets</b> (NetBox token, device password) live in the environment, never in code. <b>Choices</b> (which site, which tag) are also read from the environment with a default, so a second branch needs no code change. <b>Policy</b> (the schema, the templates) lives in the repository and goes through review like code.</p>
<pre class="code">"""settings.py - the one place that reads the environment (secrets never live in code)"""
import os

from dotenv import load_dotenv

<span class="hl">load_dotenv()          # reads .env in the project folder; a real environment variable wins over .env</span>

NETBOX_URL = os.environ["NETBOX_URL"]
NETBOX_TOKEN = os.environ["NETBOX_TOKEN"]
DEVICE_USER = os.environ["DEVICE_USER"]
DEVICE_PASSWORD = os.environ["DEVICE_PASSWORD"]
SITE = os.environ.get("MVT_SITE", "nagpur")
SCOPE_TAG = os.environ.get("MVT_TAG", "zero-touch")</pre>
<p>Square brackets fail loudly with a <code>KeyError</code> when a secret is missing, which is what you want at 02:15. A <code>.get()</code> with a default is only for choices that have a sensible default. A real environment variable beats <code>.env</code>, so cron, CI or a Vault wrapper (<code>adv-vault</code>) can supply the same names without a code change. Keep <code>.env</code> out of git and at mode 600.</p>

<h3>Logging: say what happened, never what was secret</h3>
<p>A log answers the question "what did the toolkit do last night?" It records decisions: which action ran, which device ended in which state, the exit code. It does not record data that is secret, and it does not need to.</p>
<pre class="out">AUTO01$ tail -4 logs/mvtool.log
2026-09-29 09:00:07,237 INFO NGP-BR-J1 apply=True committed and verified
2026-09-29 09:00:07,237 INFO NGP-BR-R1 apply=True committed and verified
2026-09-29 09:00:16,237 INFO action=apply exit=0
2026-09-29 09:00:21,792 INFO action=verify exit=0</pre>
<p>Use <code>INFO</code> for decisions and <code>DEBUG</code> only while you search for a bug. The danger is the debug line written in a hurry: <code>log.debug("login %s %s", host.username, host.password)</code> prints the device password on every run, and the log is copied to a ticket, a chat or a backup. Keep this in mind in the incident drill. The test of a clean log is one command: <code>grep -c NK@2026 logs/mvtool.log</code> must print 0.</p>

<div class="warn"><p><b>Lab differences.</b> The lab NetBox uses a self-signed certificate, so the code sets <code>verify = False</code> and marks it as a lab choice. On real gear point <code>verify</code> at your CA bundle. The lab clock also shows an old date in the log, which has no meaning.</p></div>

<div class="scn"><h4>The token in the history</h4><p>A new engineer committed <code>.env</code> to the shared repository on his first day, then deleted the file in the next commit. The file was gone from the folder but not from the history, and the NetBox token was readable by everybody with repository access. The token had write rights. It was rotated the same afternoon, and <code>.env</code> went into <code>.gitignore</code> together with a pre-commit check.</p><p><b>Lesson:</b> deleting a secret from the latest version does not remove it. Treat a committed secret as leaked and rotate it.</p></div>

<div class="iv"><p class="q">"Where do secrets live in your tool, and how do you know they never reach the log?"</p><p>They live in the environment, loaded by one settings module through python-dotenv from a git-ignored <code>.env</code>, and later from Vault with the same variable names. I log decisions at INFO, I never log a credential object, and I prove it with a grep for the password on the log, which must find nothing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One package, one front end, one job per module; generated folders are never edited by hand.</li>
<li>Secrets, choices and policy each have a different home.</li>
<li>Only <code>settings.py</code> reads the environment; a missing secret must stop the run.</li>
<li>Log decisions, not data; test the log with a grep for the password.</li>
<li>Exit codes are part of the interface: 0 means all is well, 1 means a person must look.</li>
</ul></div>
`,hi:`
<p>Toolkit scripts ka folder nahi hoti. Uska ek <b>shape</b> hota hai jo agle engineer ko batata hai ki har faisla kahan rehta hai, aur ek <b>frame</b> (settings, secrets, logs, exit codes) jo use bina dekhe chalana safe banata hai. <code>py-capstone</code> mein aapne yeh shape ek vendor ke liye banaya tha: ek package, ek entry point, har module ka ek kaam. Multivendor toolkit wahi idea rakhti hai aur do modules badhati hai (intent aur gate).</p>

<h3>Layout</h3>
<pre class="code">mvtoolkit/                     project folder (git repository)
  .env                         NETBOX_URL, NETBOX_TOKEN, DEVICE_USER, DEVICE_PASSWORD - kabhi commit nahi
  mvtool.py                    front end: har stage ka ek command
  mvtoolkit/                   package: har module ka ek kaam
    settings.py                akeli file jo environment padhti hai
    inventory.py               NetBox se bana Nornir inventory
    intent.py                  NetBox se intent JSON, schema se check
    render.py                  intent se Jinja2 candidate configs
    gate.py                    schema, Batfish aur address-plan checks
    safety.py                  change ke faisle (pure Python)
    change.py                  Nornir task: candidate, diff, commit, read back
    verify.py                  har device wapas padho aur intent se compare karo
  schema/intent.schema.json    intent document ka contract
  templates/ios.j2 junos.j2    har platform ka ek template
  tests/test_safety.py         woh tests jinhe router nahi chahiye
  intent/ build/ reports/ logs/    generated, delete kar sakte ho (logs ko chhodkar)</pre>
<p>Is layout ke peeche do rules hain. <b>Generated cheezein source cheezon se kabhi nahi milti</b>: <code>intent/</code>, <code>build/</code> aur <code>reports/</code> delete karke NetBox se dobara ban jaate hain, isliye koi unhe haath se edit nahi karta. <b>Front end mein logic nahi hota</b>: <code>mvtool.py</code> command line ke ek shabd ko function se jodta hai aur uski return value ko exit code banata hai.</p>
<pre class="code">ACTIONS = {"inventory": cmd_inventory, "intent": cmd_intent, "render": cmd_render, "gate": cmd_gate,
           "plan": cmd_plan, "apply": cmd_apply, "verify": cmd_verify}

def main():
    ap = argparse.ArgumentParser(description="The multivendor toolkit.")
    ap.add_argument("action", choices=sorted(ACTIONS))
    args = ap.parse_args()
<span class="hl">    code = ACTIONS[args.action](args)</span>
    logging.info("action=%s exit=%d", args.action, code)
    return code</pre>
<p>Har <code>cmd_*</code> function jo chahiye woh function ke andar import karta hai. Isse <code>python3 mvtool.py --help</code> tez rehta hai aur toolkit ek ek stage karke banti hai, jaise Lab 1 mein hota hai.</p>

<h3>Configuration: teen kism, teen ghar</h3>
<p>Jo badalta hai woh sab ek jagah nahi rehta. <b>Secrets</b> (NetBox token, device password) environment mein rehte hain, code mein kabhi nahi. <b>Choices</b> (kaunsi site, kaunsa tag) bhi environment se default ke saath padhe jaate hain, taaki doosri branch ko code change na chahiye. <b>Policy</b> (schema, templates) repository mein rehti hai aur code ki tarah review hoti hai.</p>
<pre class="code">"""settings.py - the one place that reads the environment (secrets never live in code)"""
import os

from dotenv import load_dotenv

<span class="hl">load_dotenv()          # reads .env in the project folder; a real environment variable wins over .env</span>

NETBOX_URL = os.environ["NETBOX_URL"]
NETBOX_TOKEN = os.environ["NETBOX_TOKEN"]
DEVICE_USER = os.environ["DEVICE_USER"]
DEVICE_PASSWORD = os.environ["DEVICE_PASSWORD"]
SITE = os.environ.get("MVT_SITE", "nagpur")
SCOPE_TAG = os.environ.get("MVT_TAG", "zero-touch")</pre>
<p>Square brackets secret na hone par <code>KeyError</code> ke saath zor se fail hote hain, aur 02:15 baje yahi chahiye. Default wala <code>.get()</code> sirf un choices ke liye hai jinka sensible default hai. Asli environment variable <code>.env</code> par bhaari padta hai, isliye cron, CI ya Vault wrapper (<code>adv-vault</code>) wahi naam bina code badle de sakte hain. <code>.env</code> ko git se bahar aur mode 600 par rakho.</p>

<h3>Logging: batao kya hua, secret kya tha nahi</h3>
<p>Log ek sawal ka jawab deta hai: "kal raat toolkit ne kya kiya?" Woh faisle likhta hai: kaunsa action chala, kaunsa device kis state mein pahuncha, exit code kya tha. Woh secret data nahi likhta, aur use zaroorat bhi nahi.</p>
<pre class="out">AUTO01$ tail -4 logs/mvtool.log
2026-09-29 09:00:07,237 INFO NGP-BR-J1 apply=True committed and verified
2026-09-29 09:00:07,237 INFO NGP-BR-R1 apply=True committed and verified
2026-09-29 09:00:16,237 INFO action=apply exit=0
2026-09-29 09:00:21,792 INFO action=verify exit=0</pre>
<p>Faisle <code>INFO</code> mein, <code>DEBUG</code> sirf bug dhoondhte waqt. Khatra jaldi mein likhi debug line hai: <code>log.debug("login %s %s", host.username, host.password)</code> har run mein device password print karti hai, aur log ticket, chat ya backup mein copy ho jata hai. Incident drill mein yeh yaad rakhna. Saaf log ka test ek command hai: <code>grep -c NK@2026 logs/mvtool.log</code> ko 0 print karna chahiye.</p>

<div class="warn"><p><b>Lab differences.</b> Lab ka NetBox self-signed certificate use karta hai, isliye code <code>verify = False</code> likhta hai aur use lab choice batata hai. Asli gear par <code>verify</code> ko apne CA bundle par point karo. Lab ki clock log mein purani date dikhati hai, uska koi matlab nahi.</p></div>

<div class="scn"><h4>History mein token</h4><p>Ek naye engineer ne pehle din <code>.env</code> shared repository mein commit kar di, phir agle commit mein file delete kar di. File folder se gayi par history se nahi, aur NetBox token repository access wale har kisi ko padhne ko mil gaya. Token ke paas write rights the. Usi dopahar token rotate hua, aur <code>.env</code> <code>.gitignore</code> mein gayi aur saath mein pre-commit check bhi.</p><p><b>Lesson:</b> latest version se secret delete karne se woh hatta nahi. Commit hue secret ko leaked maano aur rotate karo.</p></div>

<div class="iv"><p class="q">"Aapke tool mein secrets kahan rehte hain, aur kaise pata ki woh log mein kabhi nahi aate?"</p><p>Woh environment mein rehte hain, ek settings module python-dotenv se git-ignored <code>.env</code> se load karta hai, aur baad mein wahi variable names Vault se. Main faisle INFO par log karta hoon, credential object kabhi log nahi karta, aur saabit log par password ki grep se karta hoon, jise kuch nahi milna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek package, ek front end, har module ka ek kaam; generated folders haath se edit nahi hote.</li>
<li>Secrets, choices aur policy ke alag ghar hote hain.</li>
<li>Sirf <code>settings.py</code> environment padhti hai; missing secret run rokna chahiye.</li>
<li>Faisle log karo, data nahi; log ko password ki grep se test karo.</li>
<li>Exit codes interface ka hissa hain: 0 matlab sab theek, 1 matlab insaan dekhe.</li>
</ul></div>
`}};export{e as default};