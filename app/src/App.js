import React, { useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import {
  Button,
  ContextMenu,
  ContextMenuItem,
  DataView,
  Field,
  GU,
  Header,
  IconFile,
  Main,
  SidePanel,
  SyncIndicator,
  TextInput
} from '@aragon/ui'
import styled from 'styled-components'

function App() {
  const { api, appState } = useAragonApi()
  console.log('App State: ', appState)
  const { registry, isSyncing } = appState
  const [ panelVisible, setPanelVisible ] = useState(false)
  const [ id, setId ] = useState('')
  const [ content, setContent ] = useState('')
  const [ update, setUpdate ] = useState(false)
  console.log('Registry: ', registry)

  function updateContent(contentId) {
    setId(contentId)
    setPanelVisible(true)
  }

  function closePanel() {
    setPanelVisible(false)
    setId('')
    setContent('')
    setUpdate(false)
  }

  return (
    <Main>
      {isSyncing && <SyncIndicator />}
      <Header
        primary="Ceramic Registry"
        secondary={
          <Button
            mode="strong"
            label="New document"
            onClick={() => setPanelVisible(true)}
          />
        }
      />
      <DataView
        fields={['Id', 'Content', '']}
        entries={registry}
        renderEntry={({ id, content }) => {
          return [id, content,
            <ContextMenu>
              <ContextMenuItem
                onClick={() => {
                  setUpdate(true)
                  updateContent(id)
                }}
                css={`
                  display: flex;
                  align-items: center;
                `}
              >
                <IconFile />
                <span css={`margin-left: ${GU}px;`}>Update</span>
              </ContextMenuItem>
            </ContextMenu>
          ]
        }}
      />
      <SidePanel
        opened={panelVisible}
        onClose={() => closePanel()}
        title={`${update ? 'Update' : 'New'} document`}
      >
        <div css={`padding-top: ${2 * GU}px`}>
          <Field label='Document ID'>
            <TextInput
              value={id}
              onChange={event => {
                setId(event.target.value)
              }}
              wide
            />
          </Field>
          <Field label='Content'>
            <TextInput
              value={content}
              onChange={event => {
                setContent(event.target.value)
              }}
              wide
            />
          </Field>
          <Button
            mode='strong'
            label='Submit'
            onClick={() => {
              api.update(id, content).toPromise()
              closePanel()
            }}
            wide
          />
        </div>
      </SidePanel>
    </Main>
  )
}

export default App
