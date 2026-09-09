let d = '';
process.stdin.on('data', c => (d += c));
process.stdin.on('end', () => {
  try {
    const j = JSON.parse(d);
    const ti = j.tool_input || {};
    const desc = ti.description || (ti.prompt ? String(ti.prompt).slice(0, 60) : '') || '';
    const type = ti.subagent_type || 'agent';
    const tokens = (j.tool_response && j.tool_response.subagent_tokens) || null;
    const msg =
      '[Rule 22/27 REMINDER] Agent call finished (subagent_type="' + type + '", desc="' + desc + '"' +
      (tokens ? ', subagent_tokens=' + tokens : ', subagent_tokens=NOT REPORTED') +
      '). Before updating completedSteps for this task, add this invocation\'s measured tokens/usd into the matching spend.<role> field of the current ticket .claude/output/dev-pipeline/<ticket>-state.yml, in the SAME edit (never a separate one).';
    console.log(JSON.stringify({ systemMessage: msg }));
  } catch (e) {
    // malformed/unexpected payload - stay silent, never break the tool call
  }
});
