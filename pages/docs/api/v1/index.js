import { Component } from 'react'
import { MDXProvider } from '@mdx-js/tag'
import { withRouter } from 'next/router'
import Link from 'next/link'
import { HEADER_HEIGHT } from '~/new-components/constants'

import * as bodyLocker from '~/new-components/utils/body-locker'
import changeHash from '~/new-components/utils/change-hash'
import components from '~/new-components/mdx-components'
import Content from '~/new-components/layout/content'
import Context from '~/new-components/docs-page/context'
import DocsBuilder from '~/new-components/docs-builder'
import DocsIndex from '~/new-components/docs-index'
import getFragment from '~/new-components/docs-page/api/get-fragment'
import getHref from '~/new-components/docs-page/api/get-href'
import Head from '~/new-components/layout/head'
import Header from '~/new-components/header'
import Main from '~/new-components/layout/main'
import Page from '~/new-components/layout/page'
import scrollToElement from '~/new-components/utils/scroll-to-element'
import Select from '~/components/select'
import Sidebar from '~/new-components/layout/sidebar'
import ToggleGroup, { ToggleItem } from '~/new-components/toggle-group'
import withPermalink from '~/new-components/docs-page/api/with-permalink'
import Note from '~/components/text/note'
import { P } from '~/components/text/paragraph'
import { GenericLink } from '~/components/text/link'
import { UserContext } from '~/components/user-context'

import ApiDocs from './api-docs-mdx/index.mdx'

class APIPage extends Component {
  state = {
    activeCategory: 'getting-started',
    activeSection: 'introduction',
    activeEntry: null,
    navigationActive: false,
    version: this.props.router.asPath.split(/(v[0-9])/)[1]
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.activeCategory !== prevState.activeCategory ||
      this.state.activeSection !== prevState.activeSection ||
      this.state.activeEntry !== prevState.activeEntry
    ) {
      changeHash(
        getFragment({
          category: this.state.activeCategory,
          section: this.state.activeSection,
          entry: this.state.activeEntry
        })
      )
    }
  }

  updateActive = ({ category = null, section = null, entry = null }) => {
    if (
      this.state.activeCategory !== category ||
      this.state.activeSection !== section ||
      this.state.activeEntry !== entry
    ) {
      this.setState({
        activeCategory: category,
        activeSection: section,
        activeEntry: entry
      })
    }
  }

  setInitiallyActive = ({
    href,
    category = null,
    section = null,
    entry = null
  }) => {
    if (this.props.router.asPath.endsWith(href)) {
      this.updateActive({ category, section, entry })
    }
  }

  handleSidebarRef = node => {
    this.sidebarNode = node
  }

  handleEntryActive = entryNode => {
    scrollToElement(this.sidebarNode, entryNode)
  }

  handleSectionActive = sectionNode => {
    if (!this.state.activeEntry) {
      scrollToElement(this.sidebarNode, sectionNode)
    }
  }

  handleVersionChange = event => {
    const href = `/docs/api/${event.target.value}`
    this.props.router.push(href)
    this.handleIndexClick()
  }

  handleIndexClick = () => {
    if (this.state.navigationActive) {
      bodyLocker.unlock()
      this.setState({
        navigationActive: false
      })
    }
  }

  handleToggleNavigation = () => {
    this.setState(({ navigationActive }) => {
      if (navigationActive) {
        bodyLocker.unlock()
      } else {
        bodyLocker.lock()
      }

      return {
        navigationActive: !navigationActive
      }
    })
  }

  render() {
    const { router } = this.props
    const { navigationActive, version } = this.state
    const active = {
      category: this.state.activeCategory,
      section: this.state.activeSection,
      entry: this.state.activeEntry
    }

    return (
      <MDXProvider
        components={{
          ...components,
          h1: withPermalink(components.h1),
          h2: withPermalink(components.h2),
          h3: withPermalink(components.h3)
        }}
      >
        <Page>
          <Head
            description="A comprehensive guide to using the Now API and gaining control over the Now platform"
            title={`Now API Documentation`}
            titlePrefix=""
            titleSuffix=" - ZEIT"
          >
            <meta name="robots" content="noindex" />
          </Head>

          <UserContext.Consumer>
            {({ user, userLoaded }) => (
              <Header
                onToggleNavigation={this.handleToggleNavigation}
                user={user}
                userLoaded={userLoaded}
              />
            )}
          </UserContext.Consumer>

          <DocsBuilder docs={<ApiDocs />}>
            {({ structure }) => (
              <Main>
                <Sidebar
                  active={navigationActive}
                  innerRef={this.handleSidebarRef}
                >
                  <div className="toggle-group-wrapper">
                    <ToggleGroup>
                      <ToggleItem
                        active={
                          router.pathname.startsWith('/docs') &&
                          !router.pathname.startsWith('/docs/api')
                        }
                      >
                        <Link prefetch href="/docs">
                          <a onClick={this.handleIndexClick}>Docs</a>
                        </Link>
                      </ToggleItem>
                      <ToggleItem
                        active={router.pathname.startsWith('/docs/api')}
                      >
                        <Link prefetch href="/docs/api">
                          <a onClick={this.handleIndexClick}>API Reference</a>
                        </Link>
                      </ToggleItem>
                      <ToggleItem
                        active={router.pathname.startsWith('/examples')}
                      >
                        <Link prefetch href="/examples">
                          <a onClick={this.handleIndexClick}>Examples</a>
                        </Link>
                      </ToggleItem>
                    </ToggleGroup>
                  </div>
                  <div className="select-wrapper">
                    <h5 className="platform-select-title">
                      Now Platform Version
                    </h5>
                    <Select
                      width="100%"
                      defaultValue={version}
                      onChange={this.handleVersionChange}
                    >
                      <option value="v1">v1</option>
                      <option value="v2">v2 (Latest)</option>
                    </Select>
                  </div>
                  <DocsIndex
                    activeItem={active}
                    getHref={getHref}
                    onEntryActive={this.handleEntryActive}
                    onSectionActive={this.handleSectionActive}
                    onClickLink={this.handleIndexClick}
                    structure={structure}
                    updateActive={this.updateActive}
                    setInitiallyActive={this.setInitiallyActive}
                  />
                </Sidebar>
                <Content>
                  <div className="note">
                    <Note warning>
                      This API documentation is for <P.B>version 1</P.B> of the
                      Now platform. For the latest features, please see{' '}
                      <GenericLink href="/docs/api/v2">
                        the version 2 API reference
                      </GenericLink>. If you have yet to upgrade, see the{' '}
                      <GenericLink href="/docs/v2/platform/upgrade-to-2-0">
                        upgrade guide
                      </GenericLink>.
                    </Note>
                  </div>
                  {structure.map(category => {
                    const categorySlugs = { category: category.slug }
                    return (
                      <div
                        className="category-wrapper"
                        key={getFragment(categorySlugs)}
                      >
                        <span id={getFragment(categorySlugs)} />
                        <Context.Provider
                          value={{
                            slugs: categorySlugs,
                            updateActive: this.updateActive
                          }}
                        >
                          {category.content}
                        </Context.Provider>

                        {category.sections.map(section => {
                          const sectionSlugs = {
                            category: category.slug,
                            section: section.slug
                          }

                          return (
                            <div
                              className="section-wrapper"
                              key={getFragment(sectionSlugs)}
                            >
                              <span id={getFragment(sectionSlugs)} />
                              <Context.Provider
                                value={{
                                  slugs: sectionSlugs,
                                  updateActive: this.updateActive
                                }}
                              >
                                {section.content}
                              </Context.Provider>
                              <div>
                                {section.entries.map(entry => {
                                  const entrySlugs = {
                                    category: category.slug,
                                    section: section.slug,
                                    entry: entry.slug
                                  }

                                  return (
                                    <div
                                      className="entry-wrapper"
                                      key={getFragment(entrySlugs)}
                                    >
                                      <span id={getFragment(entrySlugs)} />
                                      <Context.Provider
                                        value={{
                                          slugs: entrySlugs,
                                          updateActive: this.updateActive
                                        }}
                                      >
                                        {entry.content}
                                      </Context.Provider>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </Content>
              </Main>
            )}
          </DocsBuilder>

          <style jsx>{`
            ul {
              list-style: none;
              margin: 0;
              padding: 0;
            }

            .note {
              padding-top: 16px;
            }

            .category-wrapper {
              padding: 40px 0;
            }

            .category-wrapper:not(:last-child) {
              border-bottom: 1px solid #eaeaea;
            }

            .category-wrapper,
            .section-wrapper,
            .entry-wrapper {
              position: relative;
            }

            span {
              position: absolute;
              top: -${HEADER_HEIGHT + 24}px;
            }

            .platform-select-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 16px;
              margin-top: 0;
            }

            .select-wrapper :global(.select) {
              width: 100%;
            }

            .toggle-group-wrapper {
              display: none;
            }

            @media screen and (max-width: 950px) {
              .toggle-group-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 40px;
              }
            }
          `}</style>
        </Page>
      </MDXProvider>
    )
  }
}

export default withRouter(APIPage)
